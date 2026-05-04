import { type JSX, createMemo } from 'solid-js'
import {
	renderBigText,
	defaultBigTextTheme,
	type BigTextRenderTheme,
	type BigTextFont,
	type BigTextAlign,
	type BigTextBackgroundColor,
	type BigTextGradient,
	type BigTextEnv,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
/**
 * Props for the BigText component — ink-big-text parity.
 *
 * Fields mirror `BigTextViewState` exactly. `text` is required; every other
 * field forwards to cfonts with its ink-big-text-equivalent default inside
 * `renderBigText`.
 */
export interface IBigTextProps {
	/** The text to render as a big ASCII font. Required. */
	text: string
	/** cfonts font face. @default 'block' */
	font?: BigTextFont
	/** Horizontal alignment. @default 'left' */
	align?: BigTextAlign
	/** Foreground colors (one per character cycling). @default ['system'] */
	colors?: readonly string[]
	/** Background color, passed to cfonts as `background`. @default 'transparent' */
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

//#region Component
/**
 * BigText — ink-big-text parity component. Renders ASCII-font blocks via
 * cfonts through the shared `renderBigText` pipeline.
 *
 * Props are read via `props.X` (not destructured) to preserve Solid
 * reactivity: destructuring a props object freezes the getters and any
 * later prop change is silently dropped.
 *
 * `createMemo` caches the cfonts call — cfonts does a full font-glyph
 * table lookup per render, so recomputing only when inputs change is a
 * meaningful win on tight render loops.
 */
export function BigText(props: IBigTextProps): JSX.Element {
	const theme = useComponentTheme<BigTextRenderTheme>('BigText')
	const { styles } = theme ?? defaultBigTextTheme

	const wnode = createMemo(() =>
		renderBigText(
			{
				text: props.text,
				font: props.font,
				align: props.align,
				colors: props.colors,
				backgroundColor: props.backgroundColor,
				letterSpacing: props.letterSpacing,
				lineHeight: props.lineHeight,
				space: props.space,
				maxLength: props.maxLength,
				gradient: props.gradient,
				independentGradient: props.independentGradient,
				transitionGradient: props.transitionGradient,
				env: props.env,
			},
			{ styles }
		)
	)

	// WHY: solid-js JSX.Element's narrow type excludes `() => JSX.Element`, but
	// Solid's `insert()` DOES treat function accessors as reactive FunctionElements.
	// Same pattern used by Badge/Alert/Spinner in this adapter.
	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component
