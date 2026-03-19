import type { Plugin } from 'esbuild'
import {
	readFileSync,
	existsSync,
	mkdirSync,
	copyFileSync,
	readdirSync,
} from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import glob from 'fast-glob'
import {
	compile,
	detectLanguage,
	parseCSS,
	generateJavaScript,
	scanCandidates,
	inlineStyles,
	tailwind,
	type ParsedStyles,
} from '@wolfie/css-parser'
import type { Framework, WolfieOptions } from './index'

const CSS_EXTENSIONS_RE = /\.(css|scss|sass|less|styl|stylus)(\?.*)?$/

//#region Native Bindings

/**
 * Generate the banner code for native binding resolution.
 * Use this with esbuild's banner option.
 *
 * @example
 * await esbuild.build({
 *   banner: { js: generateNativeBanner('cjs') },
 *   plugins: [wolfie('react')],
 * })
 */
export function generateNativeBanner(format: 'es' | 'cjs' = 'cjs'): string {
	const platform = process.platform
	const arch = process.arch

	if (format === 'es') {
		return `#!/usr/bin/env node
import { existsSync as __existsSync } from "node:fs";
import { dirname as __dirname_fn, join as __join } from "node:path";
import { fileURLToPath as __fileURLToPath } from "node:url";
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_fn(__filename);
const __nativeCandidates = ["wolfie-core.${platform}-${arch}.node","wolfie-core.${platform}-${arch}-gnu.node","wolfie-core.${platform}-${arch}-musl.node"];
const __nativePath = __nativeCandidates.find(f => __existsSync(__join(__dirname, "native/" + f)));
if (__nativePath) { process.env.NAPI_RS_NATIVE_LIBRARY_PATH = __join(__dirname, "native/" + __nativePath); }
else { console.error("Native binding not found for ${platform} ${arch}"); process.exit(1); }
`
	}

	// CJS format
	return `#!/usr/bin/env node
const __path = require("path");
const __fs = require("fs");
const __nativeCandidates = ["wolfie-core.${platform}-${arch}.node","wolfie-core.${platform}-${arch}-gnu.node","wolfie-core.${platform}-${arch}-musl.node"];
const __nativePath = __nativeCandidates.find(f => __fs.existsSync(__path.join(__dirname, "native/" + f)));
if (__nativePath) { process.env.NAPI_RS_NATIVE_LIBRARY_PATH = __path.join(__dirname, "native/" + __nativePath); }
else { console.error("Native binding not found for ${platform} ${arch}"); process.exit(1); }
`
}

/**
 * Find the @wolfie/core package and return the path to its .node files
 */
function findCoreNativeDir(root: string): string | null {
	// Try monorepo paths first (relative to project root)
	const monorepoCandidate = resolve(root, 'internal/core')
	if (existsSync(join(monorepoCandidate, 'package.json'))) {
		return monorepoCandidate
	}

	// Try node_modules
	const nodeModulesCandidate = resolve(root, 'node_modules/@wolfie/core')
	if (existsSync(join(nodeModulesCandidate, 'package.json'))) {
		return nodeModulesCandidate
	}

	// Try parent directories (for nested examples)
	let current = root
	for (let i = 0; i < 5; i++) {
		const parent = dirname(current)
		if (parent === current) break
		current = parent

		const candidate = resolve(current, 'internal/core')
		if (existsSync(join(candidate, 'package.json'))) {
			return candidate
		}
	}

	return null
}

//#endregion Native Bindings

//#region Svelte SFC Style Extraction

const SVELTE_FAKE_CSS_RE = /\.esbuild-svelte-fake-css$/

/**
 * Extract the `<style>` block from a Svelte component file.
 * Returns the raw CSS/SCSS/LESS/Stylus content and detected lang.
 */
function extractSvelteStyle(svelteFilePath: string): {
	content: string
	lang: 'css' | 'scss' | 'less' | 'stylus'
} | null {
	if (!existsSync(svelteFilePath)) return null
	const source = readFileSync(svelteFilePath, 'utf-8')

	const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/i
	const match = styleRegex.exec(source)
	if (!match) return null

	const attrs = match[1] || ''
	const styleContent = (match[2] || '').trim()
	if (!styleContent) return null

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

	return { content: styleContent, lang }
}

//#endregion Svelte SFC Style Extraction

function extractVueStyle(path: string): string | null {
	// Match unplugin-vue virtual path format: file.vue?vue&type=style&index=0...
	const match = path.match(/^(.*\.vue)\?.*index=(\d+)/)
	if (!match) return null
	const [, filePath, indexStr] = match
	const index = parseInt(indexStr, 10)

	if (!existsSync(filePath)) return null
	const content = readFileSync(filePath, 'utf-8').replace(
		/<!--[\s\S]*?-->/g,
		''
	)

	const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g
	let matchStyle
	let i = 0
	while ((matchStyle = styleRegex.exec(content)) !== null) {
		if (i === index) {
			return matchStyle[1]
		}
		i++
	}
	return null
}

/**
 * Wolfie esbuild plugin for terminal UI styling.
 *
 * Works zero-config for most use cases. Automatically:
 * - Processes CSS/SCSS/LESS/Stylus files
 * - Converts styles to JS objects for terminal rendering
 * - Uses camelCase for React, kebab-case for Vue
 * - Treats `.module.css` files as CSS Modules
 *
 * @example
 * await esbuild.build({
 *   plugins: [wolfie('react')],
 *   banner: { js: generateNativeBanner('cjs') },
 * })
 */
export function wolfie(
	framework: Framework,
	options: WolfieOptions = {}
): Plugin {
	const {
		include = CSS_EXTENSIONS_RE,
		exclude,
		nativeBindings = true,
	} = options

	const isVue = framework === 'vue'
	const isAngular = framework === 'angular'
	const isSolid = framework === 'solid'
	// Hardcoded: React/Solid use camelCase, Vue/Angular use kebab-case
	const camelCase = !isVue && !isAngular
	// Hardcoded: always inline styles (terminal UI has no stylesheets)
	const inline = true

	const globalStylesMap: ParsedStyles = {}

	async function loadAndProcessStyle(absolutePath: string) {
		let source = ''
		let filename = absolutePath
		let lang: any = ''

		let isModule = filename.includes('.module.')

		const vueStyle = extractVueStyle(absolutePath)
		if (vueStyle) {
			source = vueStyle
			filename = absolutePath.split('?')[0]!
			// Extract lang from query (e.g. &lang.scss)
			const queryLang = absolutePath.match(/lang\.([a-z]+)$/)?.[1]
			lang = (queryLang || 'css') as any
			// Check for module in query
			if (absolutePath.includes('&module=')) {
				isModule = true
			}
			// Check for scoped in query
			const isScoped = absolutePath.includes('&scoped=true')
			if (isScoped) {
				const scopeId =
					filename.match(/([^/]+)\.vue$/)?.[1]?.toLowerCase() || 'scope'
				// Match CSS class/ID selectors and append scopeId
				// Targets: .class, #id, .class:hover, .class::before, etc.
				source = source.replace(/([.#][a-zA-Z0-9_-]+)(?=[^{]*{)/g, (match) => {
					// Don't scope if already scoped (sanity check)
					if (match.endsWith(`-${scopeId}`)) return match
					return `${match}-${scopeId}`
				})
			}
		} else {
			if (!existsSync(absolutePath)) return null
			source = readFileSync(absolutePath, 'utf-8')
			lang = detectLanguage(absolutePath)
		}

		const compileResult = await compile(source, lang, filename)

		const styles = parseCSS(compileResult.css, {
			filename: filename,
			camelCaseClasses: false, // Vite uses false
		})

		// For CSS Modules and <style module>, we need to export a mapping
		// and register the scoped styles.
		if (isModule) {
			const scopeId = Math.abs(
				filename.split('').reduce((a, b) => {
					a = (a << 5) - a + b.charCodeAt(0)
					return a & a
				}, 0)
			)
				.toString(36)
				.slice(0, 8)

			const scopedStyles: Record<string, any> = {}
			const classNameMap: Record<string, string> = {}

			for (const [className, style] of Object.entries(styles)) {
				const scopedName = `${className}__${scopeId}`
				scopedStyles[scopedName] = style
				classNameMap[className] = scopedName
			}

			// In esbuild, we return the JS directly.
			// We must include the registerStyles call in the JS code.
			const pkg = isVue
				? '@wolfie/vue'
				: isAngular
					? '@wolfie/angular'
					: isSolid
						? '@wolfie/solid'
						: '@wolfie/react'
			const code = `import { registerStyles } from '${pkg}'
registerStyles(${JSON.stringify(scopedStyles)})
export default ${JSON.stringify(classNameMap)}`

			return { code, styles: scopedStyles }
		}

		// Regular styles - register and export style objects
		Object.assign(globalStylesMap, styles)

		const code = generateJavaScript(styles, {
			mode: 'global',
			camelCaseClasses: false,
			metadata: {
				...compileResult.metadata,
				register: true,
			} as any,
			framework,
		})

		return { code, styles }
	}

	function matchesPattern(
		id: string,
		pattern: string | RegExp | (string | RegExp)[]
	): boolean {
		const patterns = Array.isArray(pattern) ? pattern : [pattern]
		return patterns.some((p) => {
			if (typeof p === 'string') return id.includes(p)
			return p.test(id)
		})
	}

	return {
		name: 'wolfie',

		async setup(build) {
			const rootDir = build.initialOptions.absWorkingDir || process.cwd()
			const coreDir = nativeBindings ? findCoreNativeDir(rootDir) : null

			// Initialize Tailwind compiler
			await tailwind.initialize(rootDir)

			// Phase 1: Pre-scan source files to push candidates to Tailwind
			// Include .html for Angular templates
			const sourceFiles = await glob('**/*.{tsx,jsx,ts,js,vue,svelte,html}', {
				cwd: rootDir,
				ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
				absolute: true,
			})

			const isSvelte = framework === 'svelte'
			for (const file of sourceFiles) {
				try {
					const source = readFileSync(file, 'utf-8')
					const candidates = scanCandidates(source)
					if (candidates.size > 0) {
						tailwind.addCandidates(candidates)
					}
					// Extract and register <style> blocks from .svelte files
					// Scan-based approach — works regardless of plugin order
					if (isSvelte && file.endsWith('.svelte')) {
						const styleBlock = extractSvelteStyle(file)
						if (styleBlock) {
							const compileResult = await compile(
								styleBlock.content,
								styleBlock.lang,
								file
							)
							const styles = parseCSS(compileResult.css, {
								filename: file,
								camelCaseClasses: camelCase,
							})
							Object.assign(globalStylesMap, styles)
						}
					}
				} catch {
					// Ignore files that can't be read
				}
			}

			// Phase 2: Pre-scan CSS files to populate globalStylesMap for inlining
			if (inline) {
				const cssFiles = await glob('**/*.{css,scss,sass,less,styl,stylus}', {
					cwd: rootDir,
					ignore: ['**/node_modules/**'],
					absolute: true,
				})

				for (const file of cssFiles) {
					try {
						await loadAndProcessStyle(file)
					} catch {
						// Ignore files that can't be processed
					}
				}

				// Generate Tailwind CSS and add to globalStylesMap
				try {
					const tailwindCss = await tailwind.build()
					const tailwindStyles = parseCSS(tailwindCss, {
						filename: 'virtual:tailwind.css',
						camelCaseClasses: camelCase,
					})
					Object.assign(globalStylesMap, tailwindStyles)
				} catch {
					// Tailwind build failed, continue without it
				}
			}

			// Phase 3: Transform JS/TSX files to inline styles
			if (inline) {
				build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
					if (args.path.includes('node_modules')) return null

					try {
						const source = readFileSync(args.path, 'utf-8')

						// Collect candidates
						const candidates = scanCandidates(source)
						if (candidates.size > 0) {
							tailwind.addCandidates(candidates)
						}

						// Inline styles
						if (Object.keys(globalStylesMap).length > 0) {
							const transformed = inlineStyles(source, globalStylesMap)
							if (transformed !== source) {
								return { contents: transformed, loader: 'tsx' }
							}
						}

						return null
					} catch {
						return null
					}
				})
			}

			// Phase 3b: Intercept Svelte SFC external CSS (esbuild-svelte fake-css modules)
			// esbuild-svelte creates .esbuild-svelte-fake-css virtual modules for <style> blocks.
			// We intercept them in our own namespace and process through the wolfie CSS pipeline.
			if (framework === 'svelte') {
				build.onResolve({ filter: SVELTE_FAKE_CSS_RE }, (args) => {
					return { path: args.path, namespace: 'wolfie-svelte-css' }
				})

				build.onLoad(
					{ filter: SVELTE_FAKE_CSS_RE, namespace: 'wolfie-svelte-css' },
					async (args) => {
						// .esbuild-svelte-fake-css path maps back to the .svelte file
						const svelteFilePath = args.path.replace(
							'.esbuild-svelte-fake-css',
							'.svelte'
						)

						const styleBlock = extractSvelteStyle(svelteFilePath)
						if (!styleBlock) {
							return { contents: 'export default {}', loader: 'js' }
						}

						// Compile preprocessor and parse through wolfie CSS pipeline
						const compileResult = await compile(
							styleBlock.content,
							styleBlock.lang,
							svelteFilePath
						)
						const styles = parseCSS(compileResult.css, {
							filename: svelteFilePath,
							camelCaseClasses: camelCase,
						})

						Object.assign(globalStylesMap, styles)

						// Generate JS that registers styles in wolfie runtime
						const code = `import { registerStyles } from '@wolfie/svelte'
const styles = ${JSON.stringify(styles)}
registerStyles(styles)
export default styles`

						return {
							contents: code,
							loader: 'js',
							resolveDir: dirname(svelteFilePath),
						}
					}
				)
			}

			// Phase 4: Handle CSS/preprocessor files directly
			build.onLoad({ filter: CSS_EXTENSIONS_RE }, async (args) => {
				// Check exclude pattern
				if (exclude && matchesPattern(args.path, exclude)) {
					return null
				}

				// Check include pattern
				if (!matchesPattern(args.path, include)) {
					return null
				}

				// Skip node_modules
				if (args.path.includes('node_modules')) {
					return null
				}

				try {
					const result = await loadAndProcessStyle(args.path)
					if (!result) {
						return {
							errors: [
								{
									text: `File not found: ${args.path}`,
									location: { file: args.path },
								},
							],
						}
					}

					return {
						contents: result.code,
						loader: 'js',
						watchFiles: [args.path],
						resolveDir: dirname(args.path.split('?')[0]),
					}
				} catch (err: unknown) {
					const message = err instanceof Error ? err.message : String(err)
					return {
						errors: [{ text: message, location: { file: args.path } }],
					}
				}
			})

			// Phase 5: Copy native bindings after build
			if (nativeBindings && coreDir) {
				build.onEnd((result) => {
					if (result.errors.length > 0) return

					// Determine output directory from build options
					const outfile = build.initialOptions.outfile
					const outdir = build.initialOptions.outdir
					const outputDir = outdir || (outfile ? dirname(outfile) : null)

					if (!outputDir) {
						console.warn(
							'[wolfie] Could not determine output directory for native bindings'
						)
						return
					}

					const nativeDir = join(outputDir, 'native')

					// Create native directory
					if (!existsSync(nativeDir)) {
						mkdirSync(nativeDir, { recursive: true })
					}

					// Copy .node files
					const files = readdirSync(coreDir)
					let copied = 0
					for (const file of files) {
						if (file.endsWith('.node')) {
							copyFileSync(join(coreDir, file), join(nativeDir, file))
							copied++
						}
					}

					if (copied > 0) {
						console.log(
							`[wolfie] Copied ${copied} native binding(s) to ${nativeDir}`
						)
					}
				})
			}
		},
	}
}

export default wolfie
export { type Framework, type WolfieOptions }
