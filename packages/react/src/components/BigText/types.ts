import type {
	BigTextAlign,
	BigTextBackgroundColor,
	BigTextEnv,
	BigTextFont,
	BigTextGradient,
} from '@wolf-tui/shared'

//#region Types
/**
 * BigText props. Mirrors `BigTextViewState` 1:1 so the component is a thin
 * pass-through to `renderBigText`. Defaults match ink-big-text parity and
 * are applied inside the shared renderer — do NOT duplicate them here.
 */
export type IBigTextProps = {
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
//#endregion Types
