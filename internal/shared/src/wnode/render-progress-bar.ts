import figures from 'figures'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'

//#region Theme
export type ProgressBarRenderTheme = {
	styles: {
		completed: () => WNodeProps
		remaining: () => WNodeProps
	}
	config: () => {
		completedCharacter: string
		remainingCharacter: string
	}
}

export const defaultProgressBarTheme: ProgressBarRenderTheme = {
	styles: {
		completed: (): WNodeProps => ({ style: { color: 'magenta' } }),
		remaining: (): WNodeProps => ({ style: { color: 'gray' } }),
	},
	config: () => ({
		// WHY: same characters as all existing adapters — verified from ProgressBar.tsx
		completedCharacter: figures.square,
		remainingCharacter: figures.squareLightShade,
	}),
}
//#endregion Theme

//#region ViewState
export type ProgressBarViewState = {
	/** Progress percentage, 0–100. Clamped inside render fn. */
	value: number
	/** Container width in terminal columns — measured by the adapter via measureElement(). */
	width: number
}
//#endregion ViewState

//#region Render
/**
 * Returns the bar content WNode (completed + remaining text nodes).
 * Does NOT include the container wolfie-box with flexGrow:1 — the adapter
 * owns the container element so it can attach a DOM ref for width measurement.
 */
export function renderProgressBar(
	state: ProgressBarViewState,
	theme: ProgressBarRenderTheme = defaultProgressBarTheme
): WNode {
	const { value, width } = state
	const { styles, config } = theme

	const progress = Math.min(100, Math.max(0, value))
	// WHY: Math.round matches existing adapter behaviour (not floor/ceil)
	const complete = Math.round((progress / 100) * width)
	const remaining = width - complete
	const { completedCharacter, remainingCharacter } = config()

	const children: Array<WNode | string> = []
	if (complete > 0) {
		children.push(
			wtext(styles.completed(), [completedCharacter.repeat(complete)])
		)
	}
	if (remaining > 0) {
		children.push(
			wtext(styles.remaining(), [remainingCharacter.repeat(remaining)])
		)
	}

	// WHY: wbox with no style — the parent adapter element provides flexGrow:1/minWidth:0
	return wbox({}, children)
}
//#endregion Render
