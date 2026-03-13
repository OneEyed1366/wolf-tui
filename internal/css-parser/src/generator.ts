/**
 * Code Generator
 *
 * Generates TypeScript/JavaScript code from parsed CSS
 */

import type {
	ParsedStylesheet,
	ParsedStyles,
	GeneratorOptions,
	GeneratedOutput,
	CodeGeneratorOptions,
} from './types'
import { mapCSSProperty } from './properties'
import type { Styles } from '@wolfie/core'

//#region Utilities

/**
 * Sanitize a class name to be a valid JavaScript identifier (if possible)
 */
export function sanitizeIdentifier(name: string, camelCase = true): string {
	if (!camelCase) {
		return name
	}

	// Remove leading dot if present
	let result = name.replace(/^\./, '')

	// Convert kebab-case to camelCase
	result = result.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

	// Handle leading digits by prefixing with underscore
	if (/^\d/.test(result)) {
		result = '_' + result
	}

	// Replace any remaining invalid chars with underscores
	result = result.replace(/[^a-zA-Z0-9_$]/g, '_')

	return result
}

/**
 * Serialize a value for JavaScript output
 */
function serializeValue(value: unknown): string {
	if (typeof value === 'string') {
		// Use double quotes for strings
		return JSON.stringify(value)
	}
	if (typeof value === 'number' || typeof value === 'boolean') {
		return String(value)
	}
	if (value === null || value === undefined) {
		return 'undefined'
	}
	// For objects/arrays, use JSON.stringify
	return JSON.stringify(value)
}

/**
 * Check if a key is a valid identifier (doesn't need quotes)
 */
function isValidIdentifier(key: string): boolean {
	return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
}

//#endregion Utilities

//#region Code Generation

/**
 * Generate a style object as a string
 */
function generateStyleObject(
	styles: Record<string, unknown>,
	indent: string,
	minify: boolean
): string {
	const entries = Object.entries(styles)
	if (entries.length === 0) {
		return '{}'
	}

	if (minify) {
		const props = entries
			.map(([key, value]) => {
				const keyStr = isValidIdentifier(key) ? key : JSON.stringify(key)
				return `${keyStr}:${serializeValue(value)}`
			})
			.join(',')
		return `{${props}}`
	}

	const props = entries
		.map(([key, value]) => {
			const keyStr = isValidIdentifier(key) ? key : JSON.stringify(key)
			return `${indent}\t${keyStr}: ${serializeValue(value)}`
		})
		.join(',\n')

	return `{\n${props}\n${indent}}`
}

/**
 * Generate styles map object
 */
function generateStylesMap(
	styles: ParsedStyles,
	baseIndent: string,
	minify: boolean,
	withAsStyles: boolean,
	camelCase: boolean
): string {
	const entries = Object.entries(styles)
	if (entries.length === 0) {
		return '{}'
	}

	if (minify) {
		const props = entries
			.map(([className, styleObj]) => {
				const key = sanitizeIdentifier(className, camelCase)
				const keyStr = isValidIdentifier(key) ? key : JSON.stringify(key)
				const value = generateStyleObject(
					styleObj as Record<string, unknown>,
					'',
					true
				)
				const suffix = withAsStyles ? ' as Styles' : ''
				return `${keyStr}:${value}${suffix}`
			})
			.join(',')
		return `{${props}}`
	}

	const props = entries
		.map(([className, styleObj]) => {
			const key = sanitizeIdentifier(className, camelCase)
			const keyStr = isValidIdentifier(key) ? key : JSON.stringify(key)
			const propIndent = baseIndent + '\t'
			const value = generateStyleObject(
				styleObj as Record<string, unknown>,
				propIndent,
				false
			)
			const suffix = withAsStyles ? ' as Styles' : ''
			return `${propIndent}${keyStr}: ${value}${suffix}`
		})
		.join(',\n')

	return `{\n${props}\n${baseIndent}}`
}

//#endregion Code Generation

//#region Public API

/**
 * Generate TypeScript code from parsed styles
 *
 * @param styles - The parsed styles object (className → Styles mapping)
 * @param options - Generation options
 * @returns Generated TypeScript code string
 *
 * @example
 * // CSS Modules mode (default export)
 * generateTypeScript(styles, { mode: 'module' })
 * // → import type { Styles } from '@wolfie/core'
 * // → const styles = { ... } as const
 * // → export default styles
 *
 * @example
 * // Global mode (registerStyles)
 * generateTypeScript(styles, { mode: 'global' })
 * // → import { registerStyles } from '@wolfie/react'
 * // → registerStyles({ ... })
 */
export function generateTypeScript(
	styles: ParsedStyles,
	options: Partial<CodeGeneratorOptions> = {}
): string {
	const opts: CodeGeneratorOptions = {
		mode: options.mode ?? 'module',
		typescript: true,
		minify: options.minify ?? false,
		camelCaseClasses: options.camelCaseClasses ?? true,
		metadata: options.metadata,
		framework: options.framework,
	}

	return generateCode(styles, opts)
}

/**
 * Generate JavaScript code from parsed styles
 *
 * @param styles - The parsed styles object (className → Styles mapping)
 * @param options - Generation options
 * @returns Generated JavaScript code string
 */
export function generateJavaScript(
	styles: ParsedStyles,
	options: Partial<CodeGeneratorOptions> = {}
): string {
	const opts: CodeGeneratorOptions = {
		mode: options.mode ?? 'module',
		typescript: false,
		minify: options.minify ?? false,
		camelCaseClasses: options.camelCaseClasses ?? true,
		metadata: options.metadata,
		framework: options.framework,
	}

	return generateCode(styles, opts)
}

/**
 * Internal: Generate code with full options
 */
function generateCode(
	styles: ParsedStyles,
	options: CodeGeneratorOptions
): string {
	const { mode, typescript, minify, camelCaseClasses } = options
	const isTypeScript = typescript ?? false
	const isMinified = minify ?? false
	const camelCase = camelCaseClasses ?? true
	const lines: string[] = []

	if (mode === 'module') {
		// CSS Modules pattern: default export object
		if (isTypeScript) {
			lines.push(`import type { Styles } from '@wolfie/core'`)
			if (!isMinified) {
				lines.push('')
			}
		}

		const stylesMap = generateStylesMap(
			styles,
			'',
			isMinified,
			isTypeScript,
			camelCase
		)

		if (isMinified) {
			lines.push(`const styles=${stylesMap};export default styles`)
		} else {
			lines.push(`const styles = ${stylesMap}`)
			lines.push('')
			lines.push('export default styles')
		}
	} else {
		// Global pattern: registerStyles call
		const pkg =
			options.framework === 'vue'
				? '@wolfie/vue'
				: options.framework === 'angular'
					? '@wolfie/angular'
					: options.framework === 'solid'
						? '@wolfie/solid'
						: '@wolfie/react/styles'
		lines.push(
			`import { registerStyles, registerTailwindMetadata } from '${pkg}'`
		)
		if (!isMinified) {
			lines.push('')
		}

		if (options.metadata) {
			const metadataStr = JSON.stringify(options.metadata)
			lines.push(`registerTailwindMetadata(${metadataStr})`)
		}

		const stylesMap = generateStylesMap(
			styles,
			'',
			isMinified,
			false,
			camelCase
		)
		lines.push(`registerStyles(${stylesMap})`)
	}

	// For minified, join with semicolons where needed; for normal, join with newlines
	if (isMinified) {
		return lines.join(';')
	}
	return lines.join('\n') + '\n'
}

//#endregion Public API

//#region Legacy API

/**
 * Generate code from parsed stylesheet (legacy API)
 *
 * @deprecated Use generateTypeScript or generateJavaScript with ParsedStyles instead
 */
export function generate(
	stylesheet: ParsedStylesheet,
	options: Partial<GeneratorOptions> = {}
): GeneratedOutput {
	const opts: GeneratorOptions = {
		outputPath: options.outputPath ?? 'styles.ts',
		format: options.format ?? 'esm',
		typeDeclarations: options.typeDeclarations ?? true,
	}

	// Convert ParsedStylesheet to ParsedStyles
	const styles: ParsedStyles = {}
	for (const rule of stylesheet.rules) {
		// Extract class name from selector
		const classMatch = rule.selector.match(/\.([a-zA-Z0-9_-]+)/)
		if (!classMatch) continue

		const className = sanitizeIdentifier(classMatch[1]!)
		const styleObj: Record<string, unknown> = {}

		for (const prop of rule.properties) {
			const mapped = mapCSSProperty(prop.name, prop.value)
			if (mapped) {
				Object.assign(styleObj, mapped)
			}
		}

		if (Object.keys(styleObj).length > 0) {
			styles[className] = styleObj as Styles
		}
	}

	// Generate code using new API
	const code = generateTypeScript(styles, { mode: 'module' })
	const declarations = opts.typeDeclarations
		? generateDeclarations(styles)
		: undefined

	return {
		code,
		declarations,
	}
}

/**
 * Generate TypeScript declarations
 */
function generateDeclarations(styles: ParsedStyles): string {
	const lines: string[] = []

	lines.push("import type { Styles } from '@wolfie/core'")
	lines.push('')

	// Generate specific type with all class names
	const classNames = Object.keys(styles)
	if (classNames.length > 0) {
		lines.push('declare const styles: {')
		for (const name of classNames) {
			const key = sanitizeIdentifier(name)
			lines.push(`\t${key}: Styles`)
		}
		lines.push('}')
	} else {
		lines.push('declare const styles: Record<string, Styles>')
	}

	lines.push('')
	lines.push('export default styles')

	return lines.join('\n')
}

//#endregion Legacy API

export {
	type GeneratorOptions,
	type GeneratedOutput,
	type CodeGeneratorOptions,
}
