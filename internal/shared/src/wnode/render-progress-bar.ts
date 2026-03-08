import figures from 'figures'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { ProgressBarViewState } from './view-states'

//#region Theme
export type ProgressBarRenderTheme = {
	styles: {
		container: () => WNodeProps
		completed: () => WNodeProps
		remaining: () => WNodeProps
	}
	config: () => { completedCharacter: string; remainingCharacter: string }
}

export const defaultProgressBarTheme: ProgressBarRenderTheme = {
	styles: {
		container: (): WNodeProps => ({ style: { flexGrow: 1, minWidth: 0 } }),
		completed: (): WNodeProps => ({ style: { color: 'magenta' } }),
		remaining: (): WNodeProps => ({ style: { color: 'gray' } }),
	},
	config: () => ({
		completedCharacter: figures.square,
		remainingCharacter: figures.squareLightShade,
	}),
}
//#endregion Theme

//#region Render
export function renderProgressBar(
	state: ProgressBarViewState,
	theme: ProgressBarRenderTheme = defaultProgressBarTheme
): WNode {
	const progress = Math.min(100, Math.max(0, state.value))
	const complete = Math.round((progress / 100) * state.width)
	const remaining = state.width - complete
	const { styles, config } = theme

	const children: Array<WNode | string> = []
	if (complete > 0)
		children.push(
			wtext(styles.completed(), [config().completedCharacter.repeat(complete)])
		)
	if (remaining > 0)
		children.push(
			wtext(styles.remaining(), [config().remainingCharacter.repeat(remaining)])
		)

	return wbox(styles.container(), children)
}
//#endregion Render
