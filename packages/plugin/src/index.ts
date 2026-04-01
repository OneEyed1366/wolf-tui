import { readFileSync } from 'node:fs'
import { createUnplugin } from 'unplugin'
import type {
	UnpluginFactory,
	UnpluginInstance,
	UnpluginOptions,
} from 'unplugin'
import glob from 'fast-glob'
import {
	compile,
	detectLanguage,
	parseCSS,
	generateJavaScript,
	scanCandidates,
	extractUtilities,
	tailwind,
} from '@wolf-tui/css-parser'

//#region Svelte Style Extraction (webpack)

/**
 * Extract `<style>` block from a Svelte component and process through wolfie CSS pipeline.
 * Used during webpack scan phase to register styles before module processing.
 */
async function extractAndRegisterSvelteStyles(
	filePath: string,
	content: string,
	framework: Framework
): Promise<void> {
	const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/i
	const match = styleRegex.exec(content)
	if (!match) return

	const attrs = match[1] || ''
	const styleContent = (match[2] || '').trim()
	if (!styleContent) return

	const langMatch = attrs.match(/lang=["']?(\w+)["']?/)
	const rawLang = langMatch?.[1] || 'css'
	const lang = (
		rawLang === 'sass' || rawLang === 'scss'
			? 'scss'
			: rawLang === 'styl' || rawLang === 'stylus'
				? 'stylus'
				: rawLang === 'less'
					? 'less'
					: 'css'
	) satisfies 'css' | 'scss' | 'less' | 'stylus'

	try {
		const compileResult = await compile(styleContent, lang, filePath)
		const styles = parseCSS(compileResult.css, {
			filename: filePath,
			camelCaseClasses: false,
		})

		// Generate JS that registers styles — webpack transform will inline this
		const jsCode = generateJavaScript(styles, {
			mode: 'global',
			camelCaseClasses: false,
			metadata: compileResult.metadata,
			framework,
		})

		// Store for later injection via transform hook
		svelteStyleCache.set(filePath, jsCode)
	} catch {
		// Ignore compile errors during scan
	}
}

const svelteStyleCache = new Map<string, string>()

//#endregion Svelte Style Extraction (webpack)

//#region Types

export type Framework = 'react' | 'vue' | 'angular' | 'solid' | 'svelte'

/**
 * Wolfie plugin options.
 *
 * The plugin works zero-config for most use cases. These options are
 * escape hatches for power users.
 *
 * @example
 * // Zero-config (recommended)
 * wolfie('react')
 * wolfie('vue')
 *
 * @example
 * // Power user: custom file filtering
 * wolfie('react', { include: /\.css$/, exclude: /vendor/ })
 */
export interface WolfieOptions {
	/** File pattern to include (default: all CSS/SCSS/LESS/Stylus files) */
	include?: RegExp
	/** File pattern to exclude */
	exclude?: RegExp
	/**
	 * Handle native bindings for @wolf-tui/core (default: true)
	 * - Copies .node files to output/native/
	 * - Injects banner to set NAPI_RS_NATIVE_LIBRARY_PATH
	 */
	nativeBindings?: boolean
}

//#endregion Types

//#region Plugin Factory

const CSS_EXTENSIONS_RE = /\.(css|scss|sass|less|styl|stylus)(\?.*)?$/

export const unpluginFactory: UnpluginFactory<[Framework, WolfieOptions?]> = (
	[framework, options = {}],
	meta
): UnpluginOptions | UnpluginOptions[] => {
	const isVue = framework === 'vue'
	const isAngular = framework === 'angular'
	const camelCase = !isVue && !isAngular

	// Main CSS transform plugin
	const mainPlugin: UnpluginOptions = {
		name: 'wolfie',

		// WHY: webpack doesn't have a buildStart with config access like Vite/esbuild.
		// We tap beforeRun + watchRun to scan source files for Tailwind candidates
		// before any CSS transforms execute. Without this, tailwind.build([]) produces
		// zero utility classes → Tailwind classes (flex-col, p-1, etc.) missing from
		// the style registry → broken layout.
		webpack(compiler) {
			const scanAndAddCandidates = async () => {
				const rootDir = compiler.context || process.cwd()
				const sourceFiles = await glob(
					['**/*.{tsx,jsx,ts,js,vue,svelte,html}'],
					{
						cwd: rootDir,
						ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
						absolute: true,
					}
				)
				const isSvelte = framework === 'svelte'
				for (const file of sourceFiles) {
					try {
						const content = readFileSync(file, 'utf-8')
						const candidates = scanCandidates(content)
						if (candidates.size > 0) {
							tailwind.addCandidates(candidates)
						}
						// Extract and register <style> blocks from .svelte files
						if (isSvelte && file.endsWith('.svelte')) {
							await extractAndRegisterSvelteStyles(file, content, framework)
						}
					} catch {
						// ignore unreadable files
					}
				}
			}
			compiler.hooks.beforeRun.tapPromise(
				'wolfie:tailwind-scan',
				scanAndAddCandidates
			)
			compiler.hooks.watchRun.tapPromise(
				'wolfie:tailwind-scan',
				scanAndAddCandidates
			)
		},

		transformInclude(id) {
			// Skip virtual modules and node_modules
			if (id.startsWith('\x00') || id.includes('node_modules')) return false
			if (options.exclude?.test(id)) return false

			// For Svelte: intercept svelte-loader's CSS virtual modules
			// Format: Component.svelte.0.css (emitted by svelte-loader with emitCss)
			if (framework === 'svelte' && /\.svelte\.\d+\.css/.test(id)) {
				return true
			}

			if (options.include) return options.include.test(id)
			return CSS_EXTENSIONS_RE.test(id)
		},

		async transform(code, id) {
			// For svelte-loader CSS virtual modules, return pre-cached style registration
			if (framework === 'svelte' && /\.svelte\.\d+\.css/.test(id)) {
				const svelteFilePath = id.replace(/\.\d+\.css$/, '')
				const cached = svelteStyleCache.get(svelteFilePath)
				if (cached) {
					return { code: cached, map: null }
				}
				// Fallback: process the CSS code directly
			}

			const cleanId = id.split('?')[0]!
			const lang = detectLanguage(cleanId)

			// Extract @utility blocks from raw CSS before compile() processes them
			const utilities = extractUtilities(code)

			// Compile CSS/SCSS/etc
			const compileResult = await compile(code, lang, cleanId)

			// Parse to styles object
			// Convention: .module.css files are CSS Modules, otherwise global
			const isModule = cleanId.includes('.module.')
			const styles = parseCSS(compileResult.css, {
				filename: cleanId,
				camelCaseClasses: isModule ? camelCase : false,
			})

			// Merge @utility-extracted styles into the parsed styles
			Object.assign(styles, utilities)

			// Generate JavaScript — global registerStyles uses original CSS class
			// names so runtime resolveClassName("flex-col") finds "flex-col".
			// CSS Module exports use camelCase for valid JS property names.
			const jsCode = generateJavaScript(styles, {
				mode: isModule ? 'module' : 'global',
				camelCaseClasses: isModule ? camelCase : false,
				metadata: compileResult.metadata,
				framework,
			})

			return {
				code: jsCode,
				map: null,
			}
		},
	}

	// For Vue + Vite, we need additional plugins for SFC handling
	// These are Vite-specific and use the vite Plugin type
	if (isVue && meta.framework === 'vite') {
		// Return array of plugins - main + Vue SFC handling
		// Note: Vue SFC plugins are added via the vite entry point
		// because they need Vite-specific Plugin type
		return mainPlugin
	}

	return mainPlugin
}

//#endregion Plugin Factory

//#region Exports

export const unplugin: UnpluginInstance<[Framework, WolfieOptions?], false> =
	createUnplugin(unpluginFactory)

export default unplugin

//#endregion Exports
