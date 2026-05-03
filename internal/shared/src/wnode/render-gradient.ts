import chalk from 'chalk'
import { wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { GradientName, GradientViewState } from './view-states'

//#region Presets
const GRADIENT_PRESETS: Record<GradientName, readonly string[]> = {
	atlas: ['#feac5e', '#c779d0', '#4bc0c8'],
	cristal: ['#bdfff3', '#4ac29a'],
	teen: ['#77a1d3', '#79cbca', '#e684ae'],
	mind: ['#473b7b', '#3584a7', '#30d2be'],
	morning: ['#ff5f6d', '#ffc371'],
	vice: ['#5ee7df', '#b490ca'],
	passion: ['#f43b47', '#453a94'],
	fruit: ['#ff4e50', '#f9d423'],
	instagram: ['#833ab4', '#fd1d1d', '#fcb045'],
	retro: [
		'#3f51b1',
		'#5a55ae',
		'#7b5fac',
		'#8f6aae',
		'#a86aa4',
		'#cc6b8e',
		'#f18271',
		'#f3a469',
		'#f7c978',
	],
	summer: ['#fdbb2d', '#22c1c3'],
	rainbow: [
		'#ff0000',
		'#ff8000',
		'#ffff00',
		'#00ff00',
		'#00ffff',
		'#0000ff',
		'#8000ff',
	],
	pastel: ['#ffd1dc', '#a1c4fd'],
}
//#endregion Presets

//#region Interpolator
function hexToRgb(hex: string): [number, number, number] {
	const clean = hex.startsWith('#') ? hex.slice(1) : hex
	const full =
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean
	const n = Number.parseInt(full, 16)
	return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function rgbToHex(r: number, g: number, b: number): string {
	const clamp = (x: number): number => Math.max(0, Math.min(255, Math.round(x)))
	const toHex = (x: number): string => clamp(x).toString(16).padStart(2, '0')
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function interpolateStops(stops: readonly string[], t: number): string {
	if (stops.length === 0) return '#ffffff'
	if (stops.length === 1 || t <= 0) return stops[0]!
	if (t >= 1) return stops[stops.length - 1]!
	const segments = stops.length - 1
	const scaled = t * segments
	const idx = Math.min(Math.floor(scaled), segments - 1)
	const localT = scaled - idx
	const [r1, g1, b1] = hexToRgb(stops[idx]!)
	const [r2, g2, b2] = hexToRgb(stops[idx + 1]!)
	return rgbToHex(
		r1 + (r2 - r1) * localT,
		g1 + (g2 - g1) * localT,
		b1 + (b2 - b1) * localT
	)
}

function resolveStops(state: GradientViewState): readonly string[] {
	if (state.colors && state.colors.length > 0) return state.colors
	if (state.name) return GRADIENT_PRESETS[state.name]
	return GRADIENT_PRESETS.rainbow
}
//#endregion Interpolator

//#region Theme
export type GradientRenderTheme = {
	styles: {
		container: () => WNodeProps
		char: (props: { color: string }) => WNodeProps
	}
}

// Per-char color is applied via `internal_transform` on each inner wolfie-text.
// Nested wolfie-text styles are stripped by squashTextNodes, but squashing DOES
// invoke each child's internal_transform before concatenation — so transforms
// survive, styles don't. This matches how <Text color=...> itself is painted.
export const defaultGradientTheme: GradientRenderTheme = {
	styles: {
		container: (): WNodeProps => ({}),
		char: ({ color }): WNodeProps => ({
			internal_transform: (text: string) => chalk.hex(color)(text),
		}),
	},
}
//#endregion Theme

//#region Render
/**
 * Paints `text` with a color gradient — each visible character gets its own
 * interpolated color from the stop list (either a named preset or a
 * user-supplied `colors` array). Newlines pass through uncolored.
 */
export function renderGradient(
	state: GradientViewState,
	theme: GradientRenderTheme = defaultGradientTheme
): WNode {
	const { text } = state
	const { styles } = theme
	const stops = resolveStops(state)

	// Unicode-aware split — keeps surrogate pairs (emoji) intact.
	const glyphs = Array.from(text)
	const colorable = glyphs.filter((ch) => ch !== '\n').length
	if (colorable === 0) return wtext(styles.container(), [text])

	let colorIndex = 0
	const children: Array<WNode | string> = glyphs.map((ch) => {
		if (ch === '\n') return ch
		const t = colorable === 1 ? 0 : colorIndex / (colorable - 1)
		colorIndex += 1
		const color = interpolateStops(stops, t)
		return wtext(styles.char({ color }), [ch])
	})

	return wtext(styles.container(), children)
}
//#endregion Render
