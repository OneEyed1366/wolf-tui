/**
 * @wolf-tui/css-parser
 *
 * CSS/SCSS/Less/Stylus parser and code generator for wolfie
 */

//#region Parser Exports

export { parse, parseRule, parseCSS, extractClassName } from './parser'

//#endregion Parser Exports

//#region Preprocessor Exports

export {
	preprocess,
	compile,
	compileScss,
	compileSass,
	compileLess,
	compileStylus,
	detectLanguage,
	tailwind,
	type PreprocessorType,
	type PreprocessorResult,
	type PreprocessOptions,
} from './preprocessors'

//#endregion Preprocessor Exports

//#region Scanner & Inliner Exports

export { scanCandidates } from './scanner'
export { inlineStyles } from './inliner'
export { extractUtilities } from './utility-parser'

//#endregion Scanner & Inliner Exports

//#region Property Exports

export {
	PROPERTY_MAP,
	mapPropertyName,
	isValidProperty,
	mapCSSProperty,
} from './properties'

//#endregion Property Exports

//#region Value Exports

export {
	// New parsers
	parseNumeric,
	parseNumericOrPercent,
	parseColor,
	parseBorderStyle,
	expandGapShorthand,
	// Legacy (deprecated but kept for backward compatibility)
	transformDimension,
	transformColor,
	expandFlexShorthand,
	expandSpacingShorthand,
} from './values'

//#endregion Value Exports

//#region Generator Exports

export {
	generate,
	generateTypeScript,
	generateJavaScript,
	sanitizeIdentifier,
} from './generator'

//#endregion Generator Exports

//#region Type Exports

export type {
	ParsedRule,
	ParsedProperty,
	ParsedStylesheet,
	ParsedStyles,
	CSSParserOptions,
	GeneratorOptions,
	GeneratedOutput,
	CodeGeneratorOptions,
	VitePluginOptions,
	EsbuildPluginOptions,
} from './types'

//#endregion Type Exports
