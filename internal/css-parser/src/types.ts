/**
 * Type definitions for the CSS parser
 */

import type { Styles } from '@wolfie/core'

//#region Core Types

export interface ParsedRule {
	selector: string
	properties: ParsedProperty[]
}

export interface ParsedProperty {
	name: string
	value: string
	raw: string
}

export interface ParsedStylesheet {
	rules: ParsedRule[]
	sourceFile?: string
}

/**
 * Mapping of class names to wolfie Styles objects
 */
export interface ParsedStyles {
	[className: string]: Partial<Styles>
}

/**
 * Options for the CSS parser
 */
export interface CSSParserOptions {
	/** Source filename for error messages */
	filename?: string
	/** Generate source maps */
	sourceMap?: boolean
	/** Transform selectors to camelCase class names */
	camelCaseClasses?: boolean
	/** Optional set of class names to include (purges everything else) */
	includeCandidates?: Set<string>
}

/**
 * Supported preprocessor types
 */
export type IPreprocessorType = 'css' | 'scss' | 'less' | 'stylus'

//#endregion Core Types

//#region Generator Types

export interface GeneratorOptions {
	outputPath: string
	format: 'esm' | 'cjs'
	typeDeclarations: boolean
}

/**
 * Options for the new generateTypeScript/generateJavaScript functions
 */
export interface CodeGeneratorOptions {
	/** 'module' for CSS Modules (default export), 'global' for side-effect import (registerStyles) */
	mode: 'module' | 'global'
	/** Generate TypeScript (.ts) or JavaScript (.js) output */
	typescript?: boolean
	/** Compact output without extra whitespace */
	minify?: boolean
	/** Use camelCase for keys (default: true) */
	camelCaseClasses?: boolean
	/** Optional metadata to register (like Tailwind prefixes) */
	metadata?: {
		prefixes?: string[]
		statics?: string[]
	}
	/** Framework to import from (default: 'react') */
	framework?: 'react' | 'vue' | 'angular' | 'solid'
}

export interface GeneratedOutput {
	code: string
	declarations?: string
	sourceMap?: string
}

//#endregion Generator Types

//#region Plugin Types

/**
 * Options for the Vite plugin
 */
export interface VitePluginOptions {
	/** Output mode: 'module' for CSS Modules, 'global' for side-effect imports */
	mode?: 'module' | 'global'
	/** Generate JavaScript instead of TypeScript */
	javascript?: boolean
	/** File patterns to process (default: all CSS/preprocessor files) */
	include?: string | RegExp | (string | RegExp)[]
	/** File patterns to exclude */
	exclude?: string | RegExp | (string | RegExp)[]
	/** Transform selectors to camelCase class names (default: true) */
	camelCaseClasses?: boolean
	/** Inline styles directly in JSX (experimental) */
	inline?: boolean
	/** Framework to import from: 'react', 'vue', or 'angular' (default: 'react') */
	framework?: 'react' | 'vue' | 'angular' | 'solid'
}

/**
 * Options for the esbuild plugin
 */
export interface EsbuildPluginOptions {
	/** Output mode: 'module' for CSS Modules, 'global' for side-effect imports */
	mode?: 'module' | 'global'
	/** Filter pattern for CSS/preprocessor files */
	filter?: RegExp
	/** Inline styles directly in JSX (experimental) */
	inline?: boolean
}

//#endregion Plugin Types
