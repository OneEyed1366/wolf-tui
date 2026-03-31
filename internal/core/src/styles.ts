import { type Boxes, type BoxStyle } from 'cli-boxes'
import { type LiteralUnion } from 'type-fest'
import { type ForegroundColorName } from 'ansi-styles' // Note: We import directly from `ansi-styles` to avoid a bug in TypeScript.
import type { LayoutStyle, LayoutTree, Dimension, Edges } from './layout-types'
import { logger } from './logger'

export type IStyles = {
	/**
	Text wrapping behavior when content exceeds the container width.

	- `'wrap'` - Wrap text to next line (default)
	- `'truncate'` / `'truncate-end'` - Truncate text at the end with ellipsis
	- `'truncate-middle'` / `'middle'` - Truncate in the middle, keeping start and end
	- `'truncate-start'` / `'end'` - Truncate at the start, keeping the end

	@default 'wrap'
	*/
	textWrap?:
		| 'wrap'
		| 'end'
		| 'middle'
		| 'truncate-end'
		| 'truncate'
		| 'truncate-middle'
		| 'truncate-start'

	/**
	Positioning mode for the element.

	- `'relative'` - Position in normal flow (default)
	- `'absolute'` - Position absolutely relative to the nearest positioned ancestor

	@default 'relative'
	*/
	position?: 'absolute' | 'relative'

	/**
	Size of the gap between an element's columns.
	*/
	columnGap?: number

	/**
	Size of the gap between an element's rows.
	*/
	rowGap?: number

	/**
	Size of the gap between an element's columns and rows. A shorthand for `columnGap` and `rowGap`.
	*/
	gap?: number | string

	/**
	Margin on all sides. Equivalent to setting `marginTop`, `marginBottom`, `marginLeft`, and `marginRight`.
	*/
	margin?: number | string

	/**
	Horizontal margin. Equivalent to setting `marginLeft` and `marginRight`.
	*/
	marginX?: number | string

	/**
	Vertical margin. Equivalent to setting `marginTop` and `marginBottom`.
	*/
	marginY?: number | string

	/**
	Top margin.
	*/
	marginTop?: number | string

	/**
	Bottom margin.
	*/
	marginBottom?: number | string

	/**
	Left margin.
	*/
	marginLeft?: number | string

	/**
	Right margin.
	*/
	marginRight?: number | string

	/**
	Padding on all sides. Equivalent to setting `paddingTop`, `paddingBottom`, `paddingLeft`, and `paddingRight`.
	*/
	padding?: number | string

	/**
	Horizontal padding. Equivalent to setting `paddingLeft` and `paddingRight`.
	*/
	paddingX?: number | string

	/**
	Vertical padding. Equivalent to setting `paddingTop` and `paddingBottom`.
	*/
	paddingY?: number | string

	/**
	Top padding.
	*/
	paddingTop?: number | string

	/**
	Bottom padding.
	*/
	paddingBottom?: number | string

	/**
	Left padding.
	*/
	paddingLeft?: number | string

	/**
	Right padding.
	*/
	paddingRight?: number | string

	/**
	This property defines the ability for a flex item to grow if necessary.
	See [flex-grow](https://css-tricks.com/almanac/properties/f/flex-grow/).
	*/
	flexGrow?: number

	/**
	It specifies the “flex shrink factor”, which determines how much the flex item will shrink relative to the rest of the flex items in the flex container when there isn’t enough space on the row.
	See [flex-shrink](https://css-tricks.com/almanac/properties/f/flex-shrink/).
	*/
	flexShrink?: number

	/**
	It establishes the main-axis, thus defining the direction flex items are placed in the flex container.
	See [flex-direction](https://css-tricks.com/almanac/properties/f/flex-direction/).
	*/
	flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'

	/**
	It specifies the initial size of the flex item, before any available space is distributed according to the flex factors.
	See [flex-basis](https://css-tricks.com/almanac/properties/f/flex-basis/).
	*/
	flexBasis?: number | string

	/**
	It defines whether the flex items are forced in a single line or can be flowed into multiple lines. If set to multiple lines, it also defines the cross-axis which determines the direction new lines are stacked in.
	See [flex-wrap](https://css-tricks.com/almanac/properties/f/flex-wrap/).
	*/
	flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'

	/**
	The align-items property defines the default behavior for how items are laid out along the cross axis (perpendicular to the main axis).
	See [align-items](https://css-tricks.com/almanac/properties/a/align-items/).
	*/
	alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch'

	/**
	It makes possible to override the align-items value for specific flex items.
	See [align-self](https://css-tricks.com/almanac/properties/a/align-self/).
	*/
	alignSelf?: 'flex-start' | 'center' | 'flex-end' | 'auto'

	/**
	It defines the alignment along the main axis.
	See [justify-content](https://css-tricks.com/almanac/properties/j/justify-content/).
	*/
	justifyContent?:
		| 'flex-start'
		| 'flex-end'
		| 'space-between'
		| 'space-around'
		| 'space-evenly'
		| 'center'

	/**
	Width of the element in spaces. You can also set it as a percentage, which will calculate the width based on the width of the parent element.
	*/
	width?: number | string

	/**
	Height of the element in lines (rows). You can also set it as a percentage, which will calculate the height based on the height of the parent element.
	*/
	height?: number | string

	/**
	Sets a minimum width of the element.
	*/
	minWidth?: number | string

	/**
	Sets a minimum height of the element.
	*/
	minHeight?: number | string

	/**
	Set this property to `none` to hide the element.
	*/
	display?: 'flex' | 'none'

	/**
	Add a border with a specified style. If `borderStyle` is `undefined` (the default), no border will be added.
	*/
	borderStyle?: keyof Boxes | BoxStyle

	/**
	Determines whether the top border is visible.
	
	@default true
	*/
	borderTop?: boolean

	/**
	Determines whether the bottom border is visible.
	
	@default true
	*/
	borderBottom?: boolean

	/**
	Determines whether the left border is visible.
	
	@default true
	*/
	borderLeft?: boolean

	/**
	Determines whether the right border is visible.
	
	@default true
	*/
	borderRight?: boolean

	/**
	Change border color. A shorthand for setting `borderTopColor`, `borderRightColor`, `borderBottomColor`, and `borderLeftColor`.
	*/
	borderColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Change the top border color. Accepts the same values as `color` in `Text` component.
	*/
	borderTopColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Change the bottom border color. Accepts the same values as `color` in `Text` component.
	*/
	borderBottomColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Change the left border color. Accepts the same values as `color` in `Text` component.
	*/
	borderLeftColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Change the right border color. Accepts the same values as `color` in `Text` component.
	*/
	borderRightColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Dim the border color. A shorthand for setting `borderTopDimColor`, `borderBottomDimColor`, `borderLeftDimColor`, and `borderRightDimColor`.

	@default false
	*/
	borderDimColor?: boolean

	/**
	Dim the top border color.
	
	@default false
	*/
	borderTopDimColor?: boolean

	/**
	Dim the bottom border color.
	
	@default false
	*/
	borderBottomDimColor?: boolean

	/**
	Dim the left border color.
	
	@default false
	*/
	borderLeftDimColor?: boolean

	/**
	Dim the right border color.
	
	@default false
	*/
	borderRightDimColor?: boolean

	/**
	Behavior for an element's overflow in both directions.
	
	@default 'visible'
	*/
	overflow?: 'visible' | 'hidden'

	/**
	Behavior for an element's overflow in the horizontal direction.

	@default 'visible'
	*/
	overflowX?: 'visible' | 'hidden'

	/**
	Behavior for an element's overflow in the vertical direction.

	@default 'visible'
	*/
	overflowY?: 'visible' | 'hidden'

	/**
	Background color for the element.
	
	Accepts the same values as `color` in the `<Text>` component.
	*/
	backgroundColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Foreground color for the text.
	*/
	color?: LiteralUnion<ForegroundColorName, string>

	/**
	Make the text bold.
	*/
	fontWeight?: 'bold' | 'normal' | number

	/**
	Make the text italic.
	*/
	fontStyle?: 'italic' | 'normal'

	/**
	Text decoration (underline, strikethrough).
	*/
	textDecoration?: 'underline' | 'line-through' | 'none'

	/**
	Inverse background and foreground colors.
	*/
	inverse?: boolean
	[key: string]: string | number | boolean | undefined | object
}

//#region Shorthand Expansion

/**
 * Parse a numeric value from a string, handling basic units.
 * In the core, we treat most units as pixels (cells) unless they are viewport units or percentages.
 */
export const parseNumericValue = (
	value: string | number | undefined
): number => {
	if (value === undefined) return 0
	if (typeof value === 'number') return value

	const trimmed = value.trim().toLowerCase()
	const num = parseFloat(trimmed)
	if (isNaN(num)) return 0

	// If it has a unit, we should ideally handle it, but for now we just return the number.
	// This is used for margins/paddings where we expect cells.
	return Math.round(num)
}

/**
 * Expand spacing shorthands (margin/padding)
 */
const expandSpacing = (
	value: string | number | undefined,
	prefix: 'margin' | 'padding',
	_style: IStyles
): Partial<IStyles> => {
	if (value === undefined) return {}

	const result: Partial<IStyles> = {}
	if (typeof value === 'number') {
		result[`${prefix}Top`] = value
		result[`${prefix}Right`] = value
		result[`${prefix}Bottom`] = value
		result[`${prefix}Left`] = value
		return result
	}

	const parts = value.trim().split(/\s+/)
	switch (parts.length) {
		case 1:
			result[`${prefix}Top`] = parts[0]
			result[`${prefix}Right`] = parts[0]
			result[`${prefix}Bottom`] = parts[0]
			result[`${prefix}Left`] = parts[0]
			break
		case 2:
			result[`${prefix}Top`] = parts[0]
			result[`${prefix}Bottom`] = parts[0]
			result[`${prefix}Right`] = parts[1]
			result[`${prefix}Left`] = parts[1]
			break
		case 3:
			result[`${prefix}Top`] = parts[0]
			result[`${prefix}Right`] = parts[1]
			result[`${prefix}Left`] = parts[1]
			result[`${prefix}Bottom`] = parts[2]
			break
		case 4:
			result[`${prefix}Top`] = parts[0]
			result[`${prefix}Right`] = parts[1]
			result[`${prefix}Bottom`] = parts[2]
			result[`${prefix}Left`] = parts[3]
			break
	}
	return result
}

//#region Style Key Normalization

/**
 * Convert kebab-case CSS keys to camelCase.
 * Returns the original object unchanged if all keys are already camelCase (fast path).
 */
export const normalizeStyleKeys = (style: IStyles): IStyles => {
	let needsNormalization = false
	for (const key in style) {
		if (key.includes('-')) {
			needsNormalization = true
			break
		}
	}
	if (!needsNormalization) return style

	const result: IStyles = {}
	for (const [key, value] of Object.entries(style)) {
		const camelKey = key.includes('-')
			? key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
			: key
		;(result as Record<string, unknown>)[camelKey] = value
	}
	return result
}

//#endregion Style Key Normalization

/**
 * Expand a Styles object by resolving shorthands.
 */
export const expandStyles = (style: IStyles): IStyles => {
	const expanded: IStyles = { ...style }

	// Expand gap
	if (typeof style.gap === 'string') {
		const parts = style.gap.trim().split(/\s+/)
		if (parts.length === 1) {
			expanded.rowGap = parseNumericValue(parts[0])
			expanded.columnGap = parseNumericValue(parts[0])
		} else if (parts.length >= 2) {
			expanded.rowGap = parseNumericValue(parts[0])
			expanded.columnGap = parseNumericValue(parts[1])
		}
		delete expanded.gap
	}

	// Expand margin
	if (style.margin !== undefined) {
		Object.assign(expanded, expandSpacing(style.margin, 'margin', style))
		delete expanded.margin
	}
	if (style.marginX !== undefined) {
		expanded.marginLeft = style.marginX
		expanded.marginRight = style.marginX
		delete expanded.marginX
	}
	if (style.marginY !== undefined) {
		expanded.marginTop = style.marginY
		expanded.marginBottom = style.marginY
		delete expanded.marginY
	}

	// Expand padding
	if (style.padding !== undefined) {
		Object.assign(expanded, expandSpacing(style.padding, 'padding', style))
		delete expanded.padding
	}
	if (style.paddingX !== undefined) {
		expanded.paddingLeft = style.paddingX
		expanded.paddingRight = style.paddingX
		delete expanded.paddingX
	}
	if (style.paddingY !== undefined) {
		expanded.paddingTop = style.paddingY
		expanded.paddingBottom = style.paddingY
		delete expanded.paddingY
	}

	// Expand borderColor
	if (style.borderColor !== undefined) {
		expanded.borderTopColor = expanded.borderTopColor ?? style.borderColor
		expanded.borderRightColor = expanded.borderRightColor ?? style.borderColor
		expanded.borderBottomColor = expanded.borderBottomColor ?? style.borderColor
		expanded.borderLeftColor = expanded.borderLeftColor ?? style.borderColor
		// Keep borderColor for compatibility if needed, but usually we expand it
	}

	// Expand borderDimColor
	if (style.borderDimColor !== undefined) {
		expanded.borderTopDimColor =
			expanded.borderTopDimColor ?? style.borderDimColor
		expanded.borderRightDimColor =
			expanded.borderRightDimColor ?? style.borderDimColor
		expanded.borderBottomDimColor =
			expanded.borderBottomDimColor ?? style.borderDimColor
		expanded.borderLeftDimColor =
			expanded.borderLeftDimColor ?? style.borderDimColor
	}

	return expanded
}

//#endregion

//#region Taffy Layout Style Conversion

/**
 * Helper to convert dimension values to Taffy Dimension format
 */
const toDimension = (
	value: number | string | undefined
): Dimension | undefined => {
	if (value === undefined) return undefined
	if (typeof value === 'number') return { value, unit: 'px' }
	if (typeof value === 'string') {
		if (value.endsWith('%')) {
			return { value: parseFloat(value), unit: '%' }
		}
		// Viewport units: convert to pixel value using terminal dimensions
		// This is resolved when terminal dimensions are available
		const trimmed = value.toLowerCase()
		if (trimmed.endsWith('vw')) {
			const num = parseFloat(trimmed)
			if (!isNaN(num)) {
				// Return the numeric value directly - Taffy will use it as px
				// The viewport calculation happens in parseNumericOrPercent
				return { value: num, unit: 'px' }
			}
		}
		if (trimmed.endsWith('vh')) {
			const num = parseFloat(trimmed)
			if (!isNaN(num)) {
				return { value: num, unit: 'px' }
			}
		}
		if (trimmed.endsWith('vmin')) {
			const num = parseFloat(trimmed)
			if (!isNaN(num)) {
				return { value: num, unit: 'px' }
			}
		}
		if (trimmed.endsWith('vmax')) {
			const num = parseFloat(trimmed)
			if (!isNaN(num)) {
				return { value: num, unit: 'px' }
			}
		}
	}
	return { value: 0, unit: 'auto' }
}

/**
 * Convert wolfie Styles to Taffy LayoutStyle
 * Pure conversion function - no side effects
 */
export const toLayoutStyle = (style: IStyles): LayoutStyle => {
	const expanded = expandStyles(normalizeStyleKeys(style))
	const result: LayoutStyle = {}

	// Position
	if (expanded.position) result.position = expanded.position

	// Display
	if (expanded.display) result.display = expanded.display

	// Overflow
	if (expanded.overflow) result.overflow = expanded.overflow

	// Dimensions
	result.width = toDimension(expanded.width)
	result.height = toDimension(expanded.height)
	result.minWidth = toDimension(expanded.minWidth)
	result.minHeight = toDimension(expanded.minHeight)

	// Flex
	if (expanded.flexDirection) result.flexDirection = expanded.flexDirection
	if (expanded.flexWrap) result.flexWrap = expanded.flexWrap
	if (typeof expanded.flexGrow === 'number') result.flexGrow = expanded.flexGrow
	if (typeof expanded.flexShrink === 'number')
		result.flexShrink = expanded.flexShrink
	result.flexBasis = toDimension(expanded.flexBasis)

	// Alignment
	if (expanded.alignItems) result.alignItems = expanded.alignItems
	if (expanded.alignSelf) result.alignSelf = expanded.alignSelf
	if (expanded.justifyContent) result.justifyContent = expanded.justifyContent

	// Margin (already expanded by expandStyles)
	const hasMargin =
		expanded.marginTop !== undefined ||
		expanded.marginRight !== undefined ||
		expanded.marginBottom !== undefined ||
		expanded.marginLeft !== undefined
	if (hasMargin) {
		result.margin = {
			top: parseNumericValue(expanded.marginTop),
			right: parseNumericValue(expanded.marginRight),
			bottom: parseNumericValue(expanded.marginBottom),
			left: parseNumericValue(expanded.marginLeft),
		}
	}

	// Padding (already expanded by expandStyles)
	const hasPadding =
		expanded.paddingTop !== undefined ||
		expanded.paddingRight !== undefined ||
		expanded.paddingBottom !== undefined ||
		expanded.paddingLeft !== undefined
	if (hasPadding) {
		result.padding = {
			top: parseNumericValue(expanded.paddingTop),
			right: parseNumericValue(expanded.paddingRight),
			bottom: parseNumericValue(expanded.paddingBottom),
			left: parseNumericValue(expanded.paddingLeft),
		}
	}

	// Border (from borderStyle presence)
	if (expanded.borderStyle) {
		result.border = {
			top: expanded.borderTop !== false ? 1 : 0,
			right: expanded.borderRight !== false ? 1 : 0,
			bottom: expanded.borderBottom !== false ? 1 : 0,
			left: expanded.borderLeft !== false ? 1 : 0,
		}
	}

	// Gap
	if (expanded.gap !== undefined) {
		const gap = parseNumericValue(expanded.gap)
		result.gap = gap
	}
	if (expanded.columnGap !== undefined) {
		result.columnGap = parseNumericValue(expanded.columnGap)
	}
	if (expanded.rowGap !== undefined) {
		result.rowGap = parseNumericValue(expanded.rowGap)
	}

	return result
}

/**
 * Apply styles to Taffy layout tree
 * Equivalent to applyStyles (default export) but for Taffy
 */
export const applyLayoutStyle = (
	layoutTree: LayoutTree,
	nodeId: number,
	style: IStyles = {}
): void => {
	const taffyStyle = toLayoutStyle(style)
	if (logger.enabled) {
		logger.log({
			ts: performance.now(),
			cat: 'style',
			op: 'applyStyle',
			nodeId,
			inputStyle: style,
			taffyStyle,
		})
	}
	layoutTree.setStyle(nodeId, taffyStyle)
}

/**
 * Resolve viewport units in a style value to actual cell counts
 * vw -> columns, vh -> rows, vmin -> min(cols, rows), vmax -> max(cols, rows)
 */
const resolveViewportUnit = (
	value: number | string | undefined,
	terminalWidth: number,
	terminalHeight: number
): number | string | undefined => {
	if (value === undefined) return undefined
	if (typeof value === 'number') return value
	if (
		!value.endsWith('vw') &&
		!value.endsWith('vh') &&
		!value.endsWith('vmin') &&
		!value.endsWith('vmax')
	) {
		return value
	}

	const numValue = parseFloat(value)
	if (isNaN(numValue)) return value

	if (value.endsWith('vw')) {
		return Math.round((numValue / 100) * terminalWidth)
	}
	if (value.endsWith('vh')) {
		return Math.round((numValue / 100) * terminalHeight)
	}
	if (value.endsWith('vmin')) {
		return Math.round(
			(numValue / 100) * Math.min(terminalWidth, terminalHeight)
		)
	}
	if (value.endsWith('vmax')) {
		return Math.round(
			(numValue / 100) * Math.max(terminalWidth, terminalHeight)
		)
	}

	return value
}

/**
 * Resolve viewport units in a Styles object to actual cell counts
 * Creates a new Styles object with viewport units resolved
 */
export const resolveViewportUnits = (
	style: IStyles,
	terminalWidth: number,
	terminalHeight: number
): IStyles => {
	const resolved: Partial<IStyles> = {}

	for (const [key, value] of Object.entries(style)) {
		if (
			typeof value === 'string' &&
			(value.includes('vw') ||
				value.includes('vh') ||
				value.includes('vmin') ||
				value.includes('vmax'))
		) {
			// For string values, resolve viewport units if present
			resolved[key] = resolveViewportUnit(
				value as string,
				terminalWidth,
				terminalHeight
			)
		} else {
			resolved[key] = value
		}
	}

	return resolved as IStyles
}

//#endregion

export type { LayoutStyle, Dimension, Edges }
