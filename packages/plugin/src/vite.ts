import type { Plugin } from 'vite'
import {
	readFileSync,
	existsSync,
	readdirSync,
	statSync,
	mkdirSync,
	copyFileSync,
} from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import {
	compile,
	detectLanguage,
	parseCSS,
	generateJavaScript,
	scanCandidates,
	inlineStyles,
	extractUtilities,
	tailwind,
	type ParsedStyles,
} from '@wolf-tui/css-parser'
import type { Framework, WolfieOptions } from './index'
import { createVueSfcPlugin, createVueImportPlugin } from './vue-sfc'

const CSS_EXTENSIONS_RE = /\.(css|scss|sass|less|styl|stylus)$/

//#region Native Bindings

/**
 * Find the @wolf-tui/core package and return the path to its .node files
 */
function findCoreNativeDir(root: string): string | null {
	// Try monorepo paths first (relative to project root)
	const monorepoCandidate = resolve(root, 'internal/core')
	if (existsSync(join(monorepoCandidate, 'package.json'))) {
		return monorepoCandidate
	}

	// Try node_modules
	const nodeModulesCandidate = resolve(root, 'node_modules/@wolf-tui/core')
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

/**
 * Create a plugin that handles native binding setup
 */
function createNativeBindingsPlugin(): Plugin {
	let coreDir: string | null = null
	let outDir: string = 'dist'
	let isBuild = false

	return {
		name: 'wolfie:native-bindings',

		configResolved(config) {
			coreDir = findCoreNativeDir(config.root)
			outDir = config.build.outDir
			// Only enable for actual builds, not vite-node/dev mode
			isBuild = config.command === 'build'
		},

		closeBundle() {
			// Skip during dev mode (vite-node)
			if (!isBuild) return

			if (!coreDir) {
				console.warn(
					'[wolfie] Could not find @wolf-tui/core package for native bindings'
				)
				return
			}

			const nativeDir = join(outDir, 'native')

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
		},
	}
}

//#endregion Native Bindings

/**
 * Wolfie Vite plugin for terminal UI styling.
 *
 * Works zero-config for most use cases. Automatically:
 * - Processes CSS/SCSS/LESS/Stylus files
 * - Converts styles to JS objects for terminal rendering
 * - Uses camelCase for React, kebab-case for Vue
 * - Treats `.module.css` files as CSS Modules
 *
 * @example
 * // Vite + React
 * plugins: [wolfie('react')]
 *
 * @example
 * // Vite + Vue
 * plugins: [vue(), wolfie('vue')]
 */
export async function wolfie(
	framework: Framework,
	options: WolfieOptions = {}
): Promise<Plugin | Plugin[]> {
	const {
		include = CSS_EXTENSIONS_RE,
		exclude,
		nativeBindings = true,
	} = options

	const isVue = framework === 'vue'
	const isAngular = framework === 'angular'
	// Hardcoded: React uses camelCase, Vue/Angular use kebab-case
	const camelCase = !isVue && !isAngular
	// Hardcoded: always inline styles (terminal UI has no stylesheets)
	const inline = true

	const globalStylesMap: ParsedStyles = {}
	const virtualPrefix = '\x00wolfie:'

	// Recursively scan directory for source files and collect Tailwind candidates
	function scanDirectoryForCandidates(dir: string) {
		if (!existsSync(dir)) return

		const entries = readdirSync(dir)
		for (const entry of entries) {
			const fullPath = join(dir, entry)
			const stat = statSync(fullPath)

			if (stat.isDirectory()) {
				if (entry === 'node_modules' || entry.startsWith('.')) continue
				scanDirectoryForCandidates(fullPath)
			} else if (stat.isFile()) {
				// Include .html for Angular, .svelte for Svelte template files
				if (/\.(tsx|jsx|ts|js|vue|svelte|html)$/.test(entry)) {
					try {
						const content = readFileSync(fullPath, 'utf-8')
						const candidates = scanCandidates(content)
						if (candidates.size > 0) {
							tailwind.addCandidates(candidates)
						}
					} catch {
						// Ignore read errors
					}
				}
			}
		}
	}

	async function loadAndProcessStyle(absolutePath: string) {
		if (!existsSync(absolutePath)) return null

		// Convention: .module.css files are CSS Modules, otherwise global
		const isModule = absolutePath.includes('.module.')
		const lang = detectLanguage(absolutePath)

		const source = readFileSync(absolutePath, 'utf-8')

		// Extract @utility blocks from raw CSS before Tailwind/PostCSS eats them
		const utilities = extractUtilities(source)
		if (Object.keys(utilities).length > 0) {
			Object.assign(globalStylesMap, utilities)
		}

		const compileResult = await compile(source, lang, absolutePath)

		// For inlining: camelCase keys (the inliner's getStyle handles both formats)
		const styles = parseCSS(compileResult.css, {
			filename: absolutePath,
			camelCaseClasses: camelCase,
		})

		// Populate global map for inlining
		Object.assign(globalStylesMap, styles)

		// For global registerStyles: use original CSS class names so runtime
		// resolveClassName("flex-col") finds "flex-col", not "flexCol".
		// CSS Module exports still use camelCase for valid JS property names.
		const codeStyles = isModule
			? styles
			: parseCSS(compileResult.css, {
					filename: absolutePath,
					camelCaseClasses: false,
				})

		// Merge @utility styles into codeStyles for registerStyles() fallback
		Object.assign(codeStyles, utilities)

		const code = generateJavaScript(codeStyles, {
			mode: isModule ? 'module' : 'global',
			camelCaseClasses: isModule ? camelCase : false,
			metadata: compileResult.metadata,
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

	const mainPlugin: Plugin = {
		name: 'wolfie',
		enforce: 'pre',

		configResolved(resolvedConfig) {
			// Pre-scan source files for Tailwind candidates during build
			const root = resolvedConfig.root || process.cwd()
			scanDirectoryForCandidates(root)
		},

		async transform(code, id) {
			if (id.includes('node_modules') || id.startsWith('\x00')) return null

			// If it's a source file, collect candidates for Tailwind
			// Include .html for Angular templates
			if (id.match(/\.(tsx|jsx|ts|js|vue|svelte|html)$/)) {
				const candidates = scanCandidates(code)
				if (candidates.size > 0) {
					tailwind.addCandidates(candidates)
				}

				// Preload CSS imports for inlining
				if (inline) {
					const importMatches = code.matchAll(
						/import\s+(?:[^"']*\s+from\s+)?["']([^"']+\.(css|scss|sass|less|styl|stylus))["']/g
					)
					for (const match of importMatches) {
						const importPath = match[1]!
						const resolved = await this.resolve(importPath, id)
						if (resolved && !resolved.id.includes('node_modules')) {
							const cleanId = resolved.id.split('?')[0]!
							if (matchesPattern(cleanId, include)) {
								try {
									await loadAndProcessStyle(cleanId)
								} catch {
									// Ignore errors
								}
							}
						}
					}
				}

				// Apply style inlining
				if (inline && Object.keys(globalStylesMap).length > 0) {
					const newCode = inlineStyles(code, globalStylesMap)
					if (newCode !== code) {
						return { code: newCode, map: null }
					}
				}
			}

			return null
		},

		async resolveId(id, importer) {
			const cleanId = id.split('?')[0]!
			if (
				id.startsWith(virtualPrefix) ||
				id.startsWith('\x00') ||
				(exclude && matchesPattern(cleanId, exclude))
			) {
				return null
			}

			if (matchesPattern(cleanId, include)) {
				const resolved = await this.resolve(id, importer, { skipSelf: true })
				if (resolved && !resolved.id.includes('node_modules')) {
					// Rewrite to virtual .js module to bypass CSS pipeline
					return virtualPrefix + resolved.id + '.js'
				}
			}
			return null
		},

		async load(id) {
			if (!id.startsWith(virtualPrefix)) {
				return null
			}

			const absolutePath = id.slice(virtualPrefix.length).replace(/\.js$/, '')

			try {
				const result = await loadAndProcessStyle(absolutePath)
				if (!result) return null

				return {
					code: result.code,
					moduleType: 'js',
					map: { mappings: '' },
				}
			} catch (error) {
				this.error(`[wolfie] Error loading ${absolutePath}: ${error}`)
			}
		},
	}

	// Build the plugin array
	const plugins: Plugin[] = []

	// For Vue, add SFC handling plugins (always enabled)
	if (isVue) {
		// SFC style plugin runs BEFORE other CSS plugins
		plugins.push(createVueSfcPlugin())

		// Main CSS transform plugin
		plugins.push(mainPlugin)

		// Vue import rewrite runs AFTER Vue SFC compilation
		plugins.push(createVueImportPlugin())

		// Native bindings plugin (last, just copies files)
		if (nativeBindings) {
			plugins.push(createNativeBindingsPlugin())
		}

		return plugins
	}

	// For Svelte, add SFC style handling (intercepts ?svelte&type=style)
	if (framework === 'svelte') {
		// Dynamic import — tree-shaken for non-Svelte consumers
		const { createSvelteSfcPlugin } = await import('./svelte-sfc.js')
		plugins.push(createSvelteSfcPlugin())
	}

	// Main CSS transform plugin
	plugins.push(mainPlugin)
	if (nativeBindings) {
		plugins.push(createNativeBindingsPlugin())
	}

	return plugins.length === 1 ? plugins[0]! : plugins
}

export default wolfie
export { type Framework, type WolfieOptions }
