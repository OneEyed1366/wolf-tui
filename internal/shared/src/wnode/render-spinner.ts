import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { SpinnerViewState } from './view-states'

//#region Theme
export type SpinnerRenderTheme = {
	styles: {
		container: () => WNodeProps
		frame: () => WNodeProps
		label: () => WNodeProps
	}
}

export const defaultSpinnerTheme: SpinnerRenderTheme = {
	styles: {
		container: (): WNodeProps => ({ style: { gap: 1 } }),
		frame: (): WNodeProps => ({ style: { color: 'blue' } }),
		label: (): WNodeProps => ({}),
	},
}
//#endregion Theme

//#region Render
export function renderSpinner(
	state: SpinnerViewState,
	theme: SpinnerRenderTheme = defaultSpinnerTheme
): WNode {
	const { frame, label } = state
	const { styles } = theme

	const children: Array<WNode | string> = [wtext(styles.frame(), [frame])]

	if (label) {
		children.push(wtext(styles.label(), [label]))
	}

	return wbox(styles.container(), children)
}
//#endregion Render
