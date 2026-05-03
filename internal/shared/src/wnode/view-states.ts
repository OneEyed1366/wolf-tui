import type { Option } from '../types'

//#region Select
export type SelectViewState = {
	visibleOptions: Option[]
	focusedValue: string | undefined
	value: string | undefined
	isDisabled: boolean
	highlightText?: string
}
//#endregion Select

//#region MultiSelect
export type MultiSelectViewState = {
	visibleOptions: Option[]
	focusedValue: string | undefined
	value: string[]
	isDisabled: boolean
	highlightText?: string
}
//#endregion MultiSelect

//#region TextInput
export type TextInputViewState = {
	/** Pre-rendered string with cursor chars included. */
	inputValue: string
}
//#endregion TextInput

//#region ConfirmInput
export type ConfirmInputViewState = {
	defaultChoice: 'confirm' | 'cancel'
	isDisabled: boolean
}
//#endregion ConfirmInput

//#region Alert
export type AlertVariant = 'info' | 'success' | 'error' | 'warning'

export type AlertViewState = {
	variant: AlertVariant
	title?: string
	message: string
}
//#endregion Alert

//#region Badge
export type BadgeViewState = {
	label: string
	color?: string
}
//#endregion Badge

//#region StatusMessage
export type StatusMessageVariant = 'info' | 'success' | 'error' | 'warning'

export type StatusMessageViewState = {
	variant: StatusMessageVariant
	message: string
}
//#endregion StatusMessage

//#region Spinner
export type SpinnerViewState = {
	frame: string
	label?: string
}
//#endregion Spinner

//#region ProgressBar
export type ProgressBarViewState = {
	value: number
	width: number
}
//#endregion ProgressBar

//#region Gradient
export type GradientName =
	| 'atlas'
	| 'cristal'
	| 'teen'
	| 'mind'
	| 'morning'
	| 'vice'
	| 'passion'
	| 'fruit'
	| 'instagram'
	| 'retro'
	| 'summer'
	| 'rainbow'
	| 'pastel'

export type GradientViewState = {
	text: string
	name?: GradientName
	colors?: string[]
}
//#endregion Gradient

//#region ErrorOverview
export type ErrorOverviewStackFrame =
	| { parsed: true; fn?: string; file?: string; line?: number; column?: number }
	| { parsed: false; raw: string }

export type ErrorOverviewData = {
	message: string
	origin?: { filePath?: string; line?: number; column?: number }
	excerpt?: Array<{ line: number; value: string }>
	lineWidth: number
	stackFrames: ErrorOverviewStackFrame[]
}
//#endregion ErrorOverview

//#region BigText
/**
 * Supported cfonts fonts. Matches ink-big-text's `font` prop.
 */
export type BigTextFont =
	| 'block'
	| 'slick'
	| 'tiny'
	| 'grid'
	| 'pallet'
	| 'shade'
	| 'simple'
	| 'simpleBlock'
	| '3d'
	| 'simple3d'
	| 'chrome'
	| 'huge'

/**
 * Horizontal alignment for the generated font. Matches cfonts' `align`.
 */
export type BigTextAlign = 'left' | 'center' | 'right'

/**
 * Background color for the rendered block. Matches ink-big-text's
 * `backgroundColor` which forwards to cfonts' `background` option.
 */
export type BigTextBackgroundColor =
	| 'transparent'
	| 'black'
	| 'red'
	| 'green'
	| 'yellow'
	| 'blue'
	| 'magenta'
	| 'cyan'
	| 'white'

/**
 * Gradient configuration. Matches cfonts' `gradient` which accepts either a
 * two-color tuple array or a named gradient preset string.
 *
 * cfonts also supports `false` to disable; we model that as `undefined` in
 * the view state to stay idiomatic.
 */
export type BigTextGradient = readonly string[] | string

/**
 * Runtime environment cfonts targets. Matches cfonts' `env` option.
 *
 * - `'node'` — return ANSI escape codes (default, used by all terminal adapters)
 * - `'browser'` — return HTML markup (exposed for completeness / parity only)
 */
export type BigTextEnv = 'node' | 'browser'

/**
 * View state for the BigText component — a plain-data prop bag forwarded
 * 1:1 to cfonts at render time. Mirrors ink-big-text's prop surface plus
 * the `gradient`, `independentGradient`, `transitionGradient`, and `env`
 * options that ink-big-text does not expose but cfonts supports.
 *
 * All fields except `text` are optional; defaults are applied inside
 * `renderBigText` so adapters stay thin.
 */
export type BigTextViewState = {
	/** The text to render as a big ASCII font. Required. */
	text: string
	/** cfonts font face. @default 'block' */
	font?: BigTextFont
	/** Horizontal alignment. @default 'left' */
	align?: BigTextAlign
	/** Foreground colors (one per character cycling). @default ['system'] */
	colors?: readonly string[]
	/**
	 * Background color, passed to cfonts as `background`.
	 * @default 'transparent'
	 */
	backgroundColor?: BigTextBackgroundColor
	/** Horizontal spacing between glyphs. @default 1 */
	letterSpacing?: number
	/** Vertical spacing between glyph rows. @default 1 */
	lineHeight?: number
	/** When true, adds empty lines above and below the output. @default true */
	space?: boolean
	/** Maximum characters per line; 0 = unlimited. @default 0 */
	maxLength?: number
	/**
	 * Gradient spec: either a two-color tuple or a named preset string.
	 * Mutually non-exclusive with `colors` — cfonts prefers gradient when set.
	 */
	gradient?: BigTextGradient
	/**
	 * Recompute the gradient per line instead of across the whole block.
	 * @default false
	 */
	independentGradient?: boolean
	/**
	 * Treat `gradient` as a direct color-to-color transition instead of an
	 * interpolation palette. @default false
	 */
	transitionGradient?: boolean
	/** cfonts target environment. @default 'node' */
	env?: BigTextEnv
}
//#endregion BigText
