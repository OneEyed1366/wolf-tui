/**
 * Preprocessor adapters for SCSS, Less, and Stylus
 */

import * as path from 'node:path'
import { readFileSync, existsSync, lstatSync } from 'node:fs'
// Lazy-loaded preprocessors: only imported when actually needed.
// This avoids crashing when sass/less/stylus aren't installed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sass: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _less: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _stylus: any = null

async function getSass() {
	if (!_sass) {
		try {
			_sass = await import('sass')
		} catch {
			throw new Error(
				'sass is required for .scss/.sass files. Install it: npm i -D sass'
			)
		}
	}
	return _sass
}

async function getLess() {
	if (!_less) {
		try {
			const mod = await import('less')
			_less = mod.default ?? mod
		} catch {
			throw new Error(
				'less is required for .less files. Install it: npm i -D less'
			)
		}
	}
	return _less
}

async function getStylus() {
	if (!_stylus) {
		try {
			const mod = await import('stylus')
			_stylus = mod.default ?? mod
		} catch {
			throw new Error(
				'stylus is required for .styl files. Install it: npm i -D stylus'
			)
		}
	}
	return _stylus
}
import { createRequire } from 'node:module'
import { parseCSS } from './parser'
import type { ParsedStyles, IPreprocessorType, CSSParserOptions } from './types'
import './shim' // Apply Tailwind v4 patch
import {
	compile as tailwindCompile,
	__unstable__loadDesignSystem as loadDesignSystem,
} from 'tailwindcss'

//#region Tailwind Compiler Singleton
class TailwindCompiler {
	private static instance: TailwindCompiler
	private buildFn: ((candidates: string[]) => string) | null = null
	private metadata: PreprocessorResult['metadata'] = undefined
	private initPromise: Promise<void> | null = null
	private candidates = new Set<string>()

	private constructor() {}

	static getInstance(): TailwindCompiler {
		if (!TailwindCompiler.instance) {
			TailwindCompiler.instance = new TailwindCompiler()
		}
		return TailwindCompiler.instance
	}

	addCandidates(newCandidates: string[] | Set<string>) {
		for (const c of newCandidates) {
			this.candidates.add(c)
		}
	}

	async initialize(root: string = process.cwd()) {
		if (this.initPromise) return this.initPromise

		this.initPromise = (async () => {
			try {
				const baseCss = `
					@import "tailwindcss/theme";
					@import "tailwindcss/utilities";
				`

				const require = createRequire(path.join(root, 'package.json'))
				let tailwindPkgPath: string | undefined

				try {
					tailwindPkgPath = require.resolve('tailwindcss/package.json')
				} catch {
					// Fallback to project root if resolve fails
					const projectRequire = createRequire(
						path.join(process.cwd(), 'package.json')
					)
					try {
						tailwindPkgPath = projectRequire.resolve('tailwindcss/package.json')
					} catch {
						// Last resort: search up from root
					}
				}

				if (!tailwindPkgPath) {
					throw new Error('Could not find tailwindcss package')
				}

				const tailwindDir = path.dirname(tailwindPkgPath)

				const loadStylesheet = async (id: string, base: string) => {
					let resolvedPath = id

					// Map v4 import shorthand to actual files
					if (id === 'tailwindcss') {
						resolvedPath = path.join(tailwindDir, 'index.css')
					} else if (id === 'tailwindcss/theme') {
						resolvedPath = path.join(tailwindDir, 'theme.css')
					} else if (id === 'tailwindcss/utilities') {
						resolvedPath = path.join(tailwindDir, 'utilities.css')
					} else if (id === 'tailwindcss/preflight') {
						resolvedPath = path.join(tailwindDir, 'preflight.css')
					} else if (id.startsWith('tailwindcss/')) {
						resolvedPath = path.join(
							tailwindDir,
							id.replace('tailwindcss/', '') + '.css'
						)
					} else {
						resolvedPath = path.resolve(base, id)
					}

					if (!existsSync(resolvedPath)) {
						// Search in node_modules relative to current file or process root
						const candidates = [
							path.join(root, 'node_modules', id),
							path.join(process.cwd(), 'node_modules', id),
							path.join(tailwindDir, id.replace('tailwindcss/', '')),
						]
						for (const cand of candidates) {
							const extensions = ['', '.css']
							for (const ext of extensions) {
								const p = cand + ext
								if (existsSync(p) && !lstatSync(p).isDirectory()) {
									resolvedPath = p
									break
								}
							}
							if (
								existsSync(resolvedPath) &&
								!lstatSync(resolvedPath).isDirectory()
							)
								break
						}
					}

					if (!existsSync(resolvedPath)) {
						throw new Error(
							`Could not find stylesheet: ${id} (resolved to ${resolvedPath}). TailwindDir: ${tailwindDir}`
						)
					}

					return {
						content: readFileSync(resolvedPath, 'utf-8'),
						base: path.dirname(resolvedPath),
						path: resolvedPath,
					}
				}

				const compiled = await tailwindCompile(baseCss, {
					base: root,
					loadStylesheet,
				})

				this.buildFn = compiled.build

				try {
					const ds = await loadDesignSystem(baseCss, {
						base: root,
						loadStylesheet,
					})
					this.metadata = {
						prefixes: ds.utilities.keys('functional'),
						statics: ds.utilities.keys('static'),
					}
				} catch {
					// Metadata is optional
				}
			} catch (error) {
				console.error('[wolfie-css] Tailwind initialization failed:', error)
				this.initPromise = null
				throw error
			}
		})()

		return this.initPromise
	}

	async build(extraCandidates: string[] = []): Promise<string> {
		await this.initialize()
		if (!this.buildFn) throw new Error('Tailwind compiler not initialized')

		const allCandidates = new Set([...this.candidates, ...extraCandidates])
		return this.buildFn(Array.from(allCandidates))
	}

	getCandidateSize(): number {
		return this.candidates.size
	}

	getMetadata() {
		return this.metadata
	}
}

export const tailwind = TailwindCompiler.getInstance()
//#endregion Tailwind Compiler Singleton

//#region Types

export type { IPreprocessorType as PreprocessorType }

export interface PreprocessorResult {
	css: string
	sourceMap?: string
	watchFiles?: string[]
	metadata?: {
		prefixes?: string[]
		statics?: string[]
	}
}

export interface PreprocessOptions {
	lang?: IPreprocessorType
	filePath?: string
	sourceMap?: boolean
	candidates?: string[]
}

//#endregion Types

//#region SCSS/Sass Compilation

export async function compileScss(
	source: string,
	filePath?: string
): Promise<PreprocessorResult> {
	const sass = await getSass()
	const result = sass.compileString(source, {
		loadPaths: filePath ? [path.dirname(filePath)] : [],
		syntax: filePath?.endsWith('.sass') ? 'indented' : 'scss',
	})
	return {
		css: result.css,
		watchFiles: result.loadedUrls.map((url: URL) => url.pathname),
	}
}

export const compileSass = compileScss

//#endregion SCSS/Sass Compilation

//#region Less Compilation

export async function compileLess(
	source: string,
	filePath?: string
): Promise<PreprocessorResult> {
	const less = await getLess()
	const result = await less.render(source, {
		filename: filePath,
		paths: filePath ? [path.dirname(filePath)] : [],
	})
	return {
		css: result.css,
		sourceMap: result.map,
		watchFiles: result.imports,
	}
}

//#endregion Less Compilation

//#region Stylus Compilation

export async function compileStylus(
	source: string,
	filePath?: string
): Promise<PreprocessorResult> {
	const stylus = await getStylus()
	return new Promise((resolve, reject) => {
		const compiler = stylus(source)
		if (filePath) {
			compiler.set('filename', filePath)
			compiler.set('paths', [path.dirname(filePath)])
		}
		compiler.render((err: Error | null, css: string | undefined) => {
			if (err) reject(err)
			else resolve({ css: css ?? '', watchFiles: compiler.deps() })
		})
	})
}

//#endregion Stylus Compilation

//#region Unified API

export function detectLanguage(filename: string): IPreprocessorType {
	const ext = path.extname(filename).toLowerCase()
	switch (ext) {
		case '.scss':
		case '.sass':
			return 'scss'
		case '.less':
			return 'less'
		case '.styl':
		case '.stylus':
			return 'stylus'
		default:
			return 'css'
	}
}

/**
 * Compile source code using the specified preprocessor
 */
export async function compile(
	source: string,
	lang: IPreprocessorType,
	filePath?: string,
	candidates?: string[]
): Promise<PreprocessorResult> {
	let result: PreprocessorResult
	switch (lang) {
		case 'scss':
			result = await compileScss(source, filePath)
			break
		case 'less':
			result = await compileLess(source, filePath)
			break
		case 'stylus':
			result = await compileStylus(source, filePath)
			break
		case 'css':
		default:
			result = { css: source }
			break
	}

	const compiledCss = result.css || ''

	if (
		compiledCss &&
		(compiledCss.includes('@tailwind') ||
			/@import\s+['"]tailwindcss['"]/.test(compiledCss))
	) {
		try {
			const finalCss = await tailwind.build(candidates || [])
			return { css: finalCss, metadata: tailwind.getMetadata() }
		} catch (e) {
			console.warn('[wolfie-css] Tailwind processing failed:', e)
		}
	}

	return { ...result, css: result.css || '' }
}

export async function preprocess(
	_source: string,
	options: PreprocessOptions = {}
): Promise<ParsedStyles> {
	const lang =
		options.lang ??
		(options.filePath ? detectLanguage(options.filePath) : 'css')
	const result = await compile(
		_source,
		lang,
		options.filePath,
		options.candidates
	)
	const parserOptions: CSSParserOptions = {
		filename: options.filePath,
		sourceMap: options.sourceMap,
	}
	return parseCSS(result.css, parserOptions)
}

export async function preprocessLegacy(
	source: string,
	type: IPreprocessorType,
	filePath?: string
): Promise<PreprocessorResult> {
	return compile(source, type, filePath)
}

//#endregion Unified API
