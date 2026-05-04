import cfonts from 'cfonts'
import { wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { BigTextViewState } from './view-states'

//#region Theme
/**
 * BigText theme hook. Coloring/gradient/background are all baked into the
 * ANSI string by cfonts itself — so the wolfie-level text node cannot
 * override them (nested style.color would be stripped by squashTextNodes
 * anyway; see internal/core/src/squash-text-nodes.ts).
 *
 * The theme here exists only to shape the *containing* wolfie-text node —
 * its flex behavior, whitespace handling, and aria metadata. Keep it
 * minimal by design.
 */
export type BigTextRenderTheme = {
	styles: {
		container: () => WNodeProps
	}
}

export const defaultBigTextTheme: BigTextRenderTheme = {
	styles: {
		container: (): WNodeProps => ({
			// flexShrink: 0 — multi-line ASCII art shouldn't be squeezed; if the
			// parent is too narrow, the core renderer's `wrapText` will wrap it
			// via wrap-ansi (preserving ANSI codes).
			style: { flexShrink: 0 },
			'aria-label': undefined,
		}),
	},
}
//#endregion Theme

//#region Defaults
/**
 * Ink-big-text parity defaults. Kept as a private constant so consumers can
 * spread their own partial overrides without repeating the full set.
 */
const defaultOptions = {
	font: 'block',
	align: 'left',
	colors: ['system'],
	background: 'transparent',
	letterSpacing: 1,
	lineHeight: 1,
	space: true,
	maxLength: 0,
	gradient: false,
	independentGradient: false,
	transitionGradient: false,
	env: 'node',
} as const
//#endregion Defaults

//#region Render
/**
 * Renders a big-ASCII-font block via cfonts into a single wolfie-text node.
 *
 * Returns a WNode whose only child is the pre-rendered multi-line ANSI
 * string from `cfonts.render(...).string`. Per the text pipeline contract
 * (see memory/text-color-pipeline.md), we do NOT split the output into
 * nested styled text nodes — squashTextNodes would strip any per-segment
 * style.color. Colors/gradient/background are baked directly into the
 * ANSI bytes by cfonts, so the terminal renders them unchanged.
 *
 * If cfonts returns `false` (malformed input / unknown font) we emit an
 * empty text node rather than throwing, so the component never crashes
 * the host app mid-render.
 */
export function renderBigText(
	state: BigTextViewState,
	theme: BigTextRenderTheme = defaultBigTextTheme
): WNode {
	const {
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
	} = state

	// Map ink-big-text's prop names to cfonts' option names.
	// `backgroundColor` -> `background`, everything else 1:1.
	// Undefined overrides are skipped so cfonts applies its own defaults
	// (kept as a safety net should cfonts ever add new options).
	const options = {
		...defaultOptions,
		...(font !== undefined ? { font } : {}),
		...(align !== undefined ? { align } : {}),
		...(colors !== undefined ? { colors: [...colors] } : {}),
		...(backgroundColor !== undefined ? { background: backgroundColor } : {}),
		...(letterSpacing !== undefined ? { letterSpacing } : {}),
		...(lineHeight !== undefined ? { lineHeight } : {}),
		...(space !== undefined ? { space } : {}),
		...(maxLength !== undefined ? { maxLength } : {}),
		...(gradient !== undefined
			? {
					gradient: Array.isArray(gradient) ? [...gradient] : gradient,
				}
			: {}),
		...(independentGradient !== undefined ? { independentGradient } : {}),
		...(transitionGradient !== undefined ? { transitionGradient } : {}),
		...(env !== undefined ? { env } : {}),
	}

	// cfonts.render(input, SETTINGS) returns { string, array, lines, options }
	// on success or `false` on internal validation failure.
	const result = cfonts.render(text, options)

	const ansi =
		result !== false && typeof result.string === 'string' ? result.string : ''

	const containerProps = theme.styles.container()
	// Preserve an aria-label for screen-reader support — since cfonts output
	// is visually "text as pixels", screen readers need the raw string.
	const props: WNodeProps = {
		...containerProps,
		'aria-label': containerProps['aria-label'] ?? text,
	}

	return wtext(props, [ansi])
}
//#endregion Render
