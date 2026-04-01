/**
 * CSS Value Transformations
 *
 * Transforms CSS values to wolfie compatible values
 */

import Color from 'colorjs.io'

//#region ANSI Color Mapping

/**
 * CSS named colors mapped to ANSI-compatible color names
 */
const CSS_TO_ANSI_COLORS: Record<string, string> = {
	// Standard ANSI colors (exact matches)
	black: 'black',
	red: 'red',
	green: 'green',
	yellow: 'yellow',
	blue: 'blue',
	magenta: 'magenta',
	cyan: 'cyan',
	white: 'white',

	// Bright variants
	gray: 'gray',
	grey: 'gray',
	brightred: 'redBright',
	brightgreen: 'greenBright',
	brightyellow: 'yellowBright',
	brightblue: 'blueBright',
	brightmagenta: 'magentaBright',
	brightcyan: 'cyanBright',
	brightwhite: 'whiteBright',

	// CSS named colors → closest ANSI approximation
	darkred: 'red',
	maroon: 'red',
	crimson: 'red',
	firebrick: 'red',
	indianred: 'red',
	salmon: 'redBright',
	lightsalmon: 'redBright',
	coral: 'redBright',
	tomato: 'redBright',
	orangered: 'red',

	darkgreen: 'green',
	forestgreen: 'green',
	seagreen: 'green',
	olive: 'green',
	olivedrab: 'green',
	limegreen: 'greenBright',
	lime: 'greenBright',
	springgreen: 'greenBright',
	mediumspringgreen: 'greenBright',
	lightgreen: 'greenBright',
	palegreen: 'greenBright',

	darkblue: 'blue',
	navy: 'blue',
	midnightblue: 'blue',
	mediumblue: 'blue',
	royalblue: 'blue',
	dodgerblue: 'blueBright',
	deepskyblue: 'cyanBright',
	lightskyblue: 'cyanBright',
	skyblue: 'cyanBright',
	lightblue: 'cyanBright',
	powderblue: 'cyanBright',

	purple: 'magenta',
	darkmagenta: 'magenta',
	darkviolet: 'magenta',
	indigo: 'magenta',
	blueviolet: 'magenta',
	darkorchid: 'magenta',
	mediumorchid: 'magentaBright',
	orchid: 'magentaBright',
	violet: 'magentaBright',
	plum: 'magentaBright',
	fuchsia: 'magentaBright',
	hotpink: 'magentaBright',
	deeppink: 'magenta',
	pink: 'magentaBright',
	lightpink: 'magentaBright',

	darkcyan: 'cyan',
	teal: 'cyan',
	lightcyan: 'cyanBright',
	aqua: 'cyanBright',
	aquamarine: 'cyanBright',
	turquoise: 'cyan',
	mediumturquoise: 'cyan',
	darkturquoise: 'cyan',

	gold: 'yellow',
	orange: 'yellow',
	darkorange: 'yellow',
	goldenrod: 'yellow',
	darkgoldenrod: 'yellow',
	khaki: 'yellowBright',
	darkkhaki: 'yellow',
	palegoldenrod: 'yellowBright',
	lemonchiffon: 'yellowBright',
	lightyellow: 'yellowBright',

	brown: 'red',
	saddlebrown: 'red',
	sienna: 'red',
	chocolate: 'red',
	peru: 'yellow',
	tan: 'yellow',
	burlywood: 'yellow',
	wheat: 'yellowBright',
	sandybrown: 'yellow',
	rosybrown: 'red',

	darkgray: 'gray',
	darkgrey: 'gray',
	dimgray: 'gray',
	dimgrey: 'gray',
	lightgray: 'whiteBright',
	lightgrey: 'whiteBright',
	silver: 'whiteBright',
	gainsboro: 'whiteBright',
	whitesmoke: 'whiteBright',
	snow: 'whiteBright',
	ivory: 'whiteBright',
	floralwhite: 'whiteBright',
	ghostwhite: 'whiteBright',
	aliceblue: 'whiteBright',
	lavender: 'whiteBright',
	lavenderblush: 'whiteBright',
	linen: 'whiteBright',
	beige: 'whiteBright',
	oldlace: 'whiteBright',
	antiquewhite: 'whiteBright',
	bisque: 'whiteBright',
	blanchedalmond: 'whiteBright',
	cornsilk: 'yellowBright',
	papayawhip: 'yellowBright',
	peachpuff: 'yellowBright',
	moccasin: 'yellowBright',
	navajowhite: 'yellowBright',
	mistyrose: 'whiteBright',
	seashell: 'whiteBright',
	mintcream: 'whiteBright',
	honeydew: 'whiteBright',
	azure: 'whiteBright',

	transparent: 'transparent',
	inherit: 'inherit',
	currentcolor: 'inherit',
}

//#endregion ANSI Color Mapping

//#region Border Style Mapping

/**
 * CSS border-style values mapped to wolfie borderStyle (cli-boxes)
 */
const CSS_TO_WOLF_BORDER: Record<string, string> = {
	solid: 'single',
	double: 'double',
	dashed: 'single', // cli-boxes doesn't have dashed, use single
	dotted: 'single', // cli-boxes doesn't have dotted, use single
	groove: 'classic',
	ridge: 'classic',
	inset: 'classic',
	outset: 'classic',
	none: '', // Will be handled specially
	hidden: '', // Will be handled specially
	// wolf-tui-specific border styles (not standard CSS, but valid via arbitrary properties)
	single: 'single',
	round: 'round',
	bold: 'bold',
	singleDouble: 'singleDouble',
	doubleSingle: 'doubleSingle',
	classic: 'classic',
	arrow: 'arrow',
}

//#endregion Border Style Mapping

//#region Value Parsers

/**
 * Parse a CSS dimension value to a number
 * "4" → 4, "4px" → 4, "10em" → 10, "auto" → 0
 */
export function parseNumeric(value: string): number {
	const trimmed = value.trim().toLowerCase()

	// Handle 'auto' and other keywords
	if (trimmed === 'auto' || trimmed === 'initial' || trimmed === 'inherit') {
		return 0
	}

	// Parse number with optional unit
	const match = trimmed.match(
		/^(-?\d+(?:\.\d+)?)(px|em|rem|pt|pc|in|cm|mm|ch|vw|vh|vmin|vmax)?$/u
	)
	if (match) {
		const val = parseFloat(match[1]!)
		const unit = match[2]

		// Tailwind / Web → TUI Scaling
		// Base assumption: 1rem = 16px.
		// TUI assumption: 1 cell ≈ 4px (so 1rem = 4 cells).
		// This aligns with Tailwind's spacing scale (w-4 = 1rem = 4 cells).

		switch (unit) {
			case 'rem':
			case 'em': // Treat em as rem (static context)
				return Math.round(val * 4)
			case 'px':
				return Math.round(val / 4)
			case 'pt': // 1pt = 1.333px
				return Math.round((val * 1.333) / 4)
			case 'pc': // 1pc = 12pt = 16px = 1rem
				return Math.round(val * 4)
			case 'in': // 1in = 96px = 6rem
				return Math.round(val * 24)
			case 'cm': // 1cm = 37.8px
				return Math.round((val * 37.8) / 4)
			case 'mm': // 1mm = 3.78px
				return Math.round((val * 3.78) / 4)
			case 'ch':
				// 1ch = 1 character width = 1 cell
				return Math.round(val)
			case 'vw':
			case 'vh':
			case 'vmin':
			case 'vmax':
				// Viewport units cannot be resolved statically to numbers.
				// We fallback to 1:1 pass-through (treating them as cells)
				// or 0. Pass-through is safer for "100vw" -> 100 cells (better than 0).
				return Math.round(val)
			default:
				return Math.round(val)
		}
	}

	// Try parsing as plain number
	const num = parseFloat(trimmed)
	return isNaN(num) ? 0 : num
}

/**
 * Parse a CSS dimension value, keeping percentages and viewport units as strings
 * "4" → 4, "4px" → 4, "50%" → "50%", "100vw" → "100vw"
 */
export function parseNumericOrPercent(value: string): number | string {
	const trimmed = value.trim().toLowerCase()

	// Handle 'auto' keyword - wolfie doesn't support it, return undefined-like
	if (trimmed === 'auto' || trimmed === 'initial' || trimmed === 'inherit') {
		return 0
	}

	// Percentage values stay as strings
	if (trimmed.endsWith('%')) {
		return trimmed
	}

	// Viewport units: Keep as-is to be resolved by the renderer based on terminal dimensions
	if (
		trimmed.endsWith('vw') ||
		trimmed.endsWith('vh') ||
		trimmed.endsWith('vmin') ||
		trimmed.endsWith('vmax')
	) {
		const val = parseFloat(trimmed)
		if (!isNaN(val)) {
			return trimmed
		}
	}

	// Parse as numeric
	return parseNumeric(trimmed)
}

/**
 * Parse a CSS color value to ANSI-compatible name or hex
 * Supports: named colors, hex (#fff, #ffffff), rgb(), rgba()
 */
export function parseColor(value: string): string {
	const trimmed = value.trim().toLowerCase()

	// Check for named color mapping
	const namedColor = CSS_TO_ANSI_COLORS[trimmed]
	if (namedColor) {
		return namedColor
	}

	// Hex colors - pass through (chalk/ansi-styles supports hex)
	if (trimmed.startsWith('#')) {
		// Normalize 3-char hex to 6-char
		if (trimmed.length === 4) {
			const r = trimmed[1]
			const g = trimmed[2]
			const b = trimmed[3]
			return `#${r}${r}${g}${g}${b}${b}`
		}
		return trimmed
	}

	// Modern: rgb(255 255 255 / 0.5) or rgb(255 255 255)
	const rgbMatch = trimmed.match(
		// eslint-disable-next-line no-useless-escape
		/^rgba?\s*\(\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:\s*[\/\s]\s*.*)?\)$/u
	)
	const legacyRgbMatch = trimmed.match(
		/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)$/
	)
	const match = rgbMatch || legacyRgbMatch

	if (match) {
		const r = Math.min(255, Math.round(parseFloat(match[1]!)))
		const g = Math.min(255, Math.round(parseFloat(match[2]!)))
		const b = Math.min(255, Math.round(parseFloat(match[3]!)))
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
	}

	// Modern Color functions (OKLCH, HSL, P3) via colorjs.io
	if (
		trimmed.startsWith('oklch') ||
		trimmed.startsWith('hsl') ||
		trimmed.startsWith('color(') ||
		trimmed.startsWith('lab') ||
		trimmed.startsWith('lch')
	) {
		try {
			const color = new Color(value)
			return color.to('srgb').toString({ format: 'hex' })
		} catch (e) {
			console.warn(`[wolfie-css] parseColor:`, e)
		}
	}

	// Return as-is for unknown values
	return trimmed
}

/**
 * Parse a CSS border-style value to wolfie borderStyle
 */
export function parseBorderStyle(value: string): string | null {
	const trimmed = value.trim().toLowerCase()

	const mapped = CSS_TO_WOLF_BORDER[trimmed]
	if (mapped !== undefined) {
		return mapped || null // Return null for 'none'/'hidden'
	}

	// Return 'single' as default for unknown styles
	return 'single'
}

//#endregion Value Parsers

//#region Legacy Value Transformers (for backward compatibility)

/**
 * Transform a CSS dimension value (e.g., "10px", "50%") to a wolfie value
 * @deprecated Use parseNumericOrPercent instead
 */
export function transformDimension(value: string): string | number {
	return parseNumericOrPercent(value)
}

/**
 * Transform a CSS color value to a wolfie color
 * @deprecated Use parseColor instead
 */
export function transformColor(value: string): string {
	return parseColor(value)
}

/**
 * Transform a CSS flex shorthand to individual properties
 */
export function expandFlexShorthand(
	value: string
): Record<string, string | number> {
	const parts = value.trim().split(/\s+/)
	const result: Record<string, string | number> = {}

	if (parts.length === 1) {
		// Single value: flex-grow or keyword
		const val = parts[0]!.toLowerCase()
		if (val === 'none') {
			result['flexGrow'] = 0
			result['flexShrink'] = 0
			result['flexBasis'] = 'auto'
		} else if (val === 'auto') {
			result['flexGrow'] = 1
			result['flexShrink'] = 1
			result['flexBasis'] = 'auto'
		} else if (val === 'initial') {
			result['flexGrow'] = 0
			result['flexShrink'] = 1
			result['flexBasis'] = 'auto'
		} else {
			// Single number = flex-grow
			const num = parseFloat(val)
			if (!isNaN(num)) {
				result['flexGrow'] = num
			}
		}
	} else if (parts.length === 2) {
		// Two values: flex-grow flex-shrink OR flex-grow flex-basis
		const first = parseFloat(parts[0]!)
		const second = parts[1]!
		result['flexGrow'] = isNaN(first) ? 0 : first

		const secondNum = parseFloat(second)
		if (!isNaN(secondNum) && !second.includes('%') && !second.includes('px')) {
			result['flexShrink'] = secondNum
		} else {
			result['flexBasis'] = parseNumericOrPercent(second)
		}
	} else if (parts.length >= 3) {
		// Three values: flex-grow flex-shrink flex-basis
		result['flexGrow'] = parseFloat(parts[0]!) || 0
		result['flexShrink'] = parseFloat(parts[1]!) || 0
		result['flexBasis'] = parseNumericOrPercent(parts[2]!)
	}

	return result
}

/**
 * Transform a CSS margin/padding shorthand to individual properties
 */
export function expandSpacingShorthand(
	value: string,
	prefix: 'margin' | 'padding'
): Record<string, string | number> {
	const parts = value.trim().split(/\s+/)
	const result: Record<string, string | number> = {}

	switch (parts.length) {
		case 1:
			result[`${prefix}Top`] = parseNumericOrPercent(parts[0]!)
			result[`${prefix}Right`] = parseNumericOrPercent(parts[0]!)
			result[`${prefix}Bottom`] = parseNumericOrPercent(parts[0]!)
			result[`${prefix}Left`] = parseNumericOrPercent(parts[0]!)
			break
		case 2:
			result[`${prefix}Top`] = parseNumericOrPercent(parts[0]!)
			result[`${prefix}Bottom`] = parseNumericOrPercent(parts[0]!)
			result[`${prefix}Right`] = parseNumericOrPercent(parts[1]!)
			result[`${prefix}Left`] = parseNumericOrPercent(parts[1]!)
			break
		case 3:
			result[`${prefix}Top`] = parseNumericOrPercent(parts[0]!)
			result[`${prefix}Right`] = parseNumericOrPercent(parts[1]!)
			result[`${prefix}Left`] = parseNumericOrPercent(parts[1]!)
			result[`${prefix}Bottom`] = parseNumericOrPercent(parts[2]!)
			break
		case 4:
			result[`${prefix}Top`] = parseNumericOrPercent(parts[0]!)
			result[`${prefix}Right`] = parseNumericOrPercent(parts[1]!)
			result[`${prefix}Bottom`] = parseNumericOrPercent(parts[2]!)
			result[`${prefix}Left`] = parseNumericOrPercent(parts[3]!)
			break
	}

	return result
}

/**
 * Expand gap shorthand to row-gap and column-gap
 */
export function expandGapShorthand(value: string): Record<string, number> {
	const parts = value.trim().split(/\s+/)
	const result: Record<string, number> = {}

	if (parts.length === 1) {
		const val = parseNumeric(parts[0]!)
		result['rowGap'] = val
		result['columnGap'] = val
	} else if (parts.length >= 2) {
		result['rowGap'] = parseNumeric(parts[0]!)
		result['columnGap'] = parseNumeric(parts[1]!)
	}

	return result
}

//#endregion Legacy Value Transformers
