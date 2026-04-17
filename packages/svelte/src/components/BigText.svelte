<!-- #region Script -->
<script lang="ts">
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
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'

	//#region Props
	let {
		text,
		font,
		align,
		colors,
		backgroundColor,
		letterSpacing,
		lineHeight,
		space,
		maxLength,
		gradient,
		independentGradient,
		transitionGradient,
		env,
	}: {
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
	} = $props()
	//#endregion Props

	const theme = useComponentTheme<BigTextRenderTheme>('BigText')

	// WHY: forward props 1:1 to the shared render function. cfonts bakes
	// colors/gradient/background directly into the ANSI string, so the
	// Svelte layer stays a pure data pass-through — no per-segment text
	// styling (squashTextNodes would strip it anyway).
	let wnode = $derived(
		renderBigText(
			{
				text,
				font,
				align,
				colors,
				backgroundColor,
				letterSpacing,
				lineHeight,
				space,
				maxLength,
				gradient,
				independentGradient,
				transitionGradient,
				env,
			} satisfies BigTextViewState,
			theme ?? defaultBigTextTheme
		)
	)
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<wolfie-box use:mountWNode={wnode}></wolfie-box>
<!-- #endregion Template -->
