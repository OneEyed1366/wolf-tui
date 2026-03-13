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
	tailwind,
} from '@wolfie/css-parser'

//#region Types

export type Framework = 'react' | 'vue' | 'angular' | 'solid'

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
	 * Handle native bindings for @wolfie/core (default: true)
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
				const sourceFiles = await glob(['**/*.{tsx,jsx,ts,js,vue,html}'], {
					cwd: rootDir,
					ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
					absolute: true,
				})
				for (const file of sourceFiles) {
					try {
						const content = readFileSync(file, 'utf-8')
						const candidates = scanCandidates(content)
						if (candidates.size > 0) {
							tailwind.addCandidates(candidates)
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
			if (options.include) return options.include.test(id)
			return CSS_EXTENSIONS_RE.test(id)
		},

		async transform(code, id) {
			const cleanId = id.split('?')[0]!
			const lang = detectLanguage(cleanId)

			// Compile CSS/SCSS/etc
			const compileResult = await compile(code, lang, cleanId)

			// Parse to styles object
			// Convention: .module.css files are CSS Modules, otherwise global
			const isModule = cleanId.includes('.module.')
			const styles = parseCSS(compileResult.css, {
				filename: cleanId,
				camelCaseClasses: camelCase,
			})

			// Generate JavaScript
			const jsCode = generateJavaScript(styles, {
				mode: isModule ? 'module' : 'global',
				camelCaseClasses: camelCase,
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
