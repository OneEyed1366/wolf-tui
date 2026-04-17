import { defineComponent, type PropType } from 'vue'
import {
	renderBigText,
	defaultBigTextTheme,
	type BigTextRenderTheme,
	type BigTextViewState,
	type BigTextFont,
	type BigTextAlign,
	type BigTextBackgroundColor,
	type BigTextGradient,
	type BigTextEnv,
} from '@wolf-tui/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export {
	type BigTextFont,
	type BigTextAlign,
	type BigTextBackgroundColor,
	type BigTextGradient,
	type BigTextEnv,
}

/**
 * Props for the BigText component. Mirrors `BigTextViewState` from
 * `@wolf-tui/shared` 1:1 — ink-big-text parity plus cfonts' extra options
 * (`gradient`, `independentGradient`, `transitionGradient`, `env`).
 */
export interface BigTextProps {
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
	/** Gradient spec: a two-color tuple or a named preset string. */
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
export const BigText = defineComponent({
	name: 'BigText',
	props: {
		text: {
			type: String,
			required: true,
		},
		font: {
			type: String as PropType<BigTextFont>,
			default: undefined,
		},
		align: {
			type: String as PropType<BigTextAlign>,
			default: undefined,
		},
		colors: {
			type: Array as PropType<readonly string[]>,
			default: undefined,
		},
		backgroundColor: {
			type: String as PropType<BigTextBackgroundColor>,
			default: undefined,
		},
		letterSpacing: {
			type: Number,
			default: undefined,
		},
		lineHeight: {
			type: Number,
			default: undefined,
		},
		space: {
			type: Boolean,
			default: undefined,
		},
		maxLength: {
			type: Number,
			default: undefined,
		},
		gradient: {
			type: [Array, String] as PropType<BigTextGradient>,
			default: undefined,
		},
		independentGradient: {
			type: Boolean,
			default: undefined,
		},
		transitionGradient: {
			type: Boolean,
			default: undefined,
		},
		env: {
			type: String as PropType<BigTextEnv>,
			default: undefined,
		},
	},
	setup(props) {
		return () => {
			// WHY: forward props 1:1 to the shared render function. cfonts bakes
			// colors/gradient/background directly into the ANSI string, so the
			// Vue layer stays a pure data pass-through — no VNode wrapping, no
			// per-segment text styling (squashTextNodes would strip it anyway).
			const state: BigTextViewState = {
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
			}
			return wNodeToVue(renderBigText(state, defaultBigTextTheme))
		}
	},
})
//#endregion Component

export {
	defaultBigTextTheme as bigTextTheme,
	type BigTextRenderTheme as BigTextTheme,
}
