import type { Styles } from '@wolfie/core'
import { wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { BadgeViewState } from './view-states'

//#region Theme
export type BadgeRenderTheme = {
	styles: {
		container: (props: { color?: Styles['color'] }) => WNodeProps
		label: () => WNodeProps
	}
}

export const defaultBadgeTheme: BadgeRenderTheme = {
	styles: {
		container: ({ color }): WNodeProps => ({
			style: { backgroundColor: color },
		}),
		label: (): WNodeProps => ({
			style: { color: 'black' },
		}),
	},
}
//#endregion Theme

//#region Render
export function renderBadge(
	state: BadgeViewState,
	theme: BadgeRenderTheme = defaultBadgeTheme
): WNode {
	const { label, color } = state
	const { styles } = theme

	return wtext(styles.container({ color: color as Styles['color'] }), [
		' ',
		wtext(styles.label(), [label]),
		' ',
	])
}
//#endregion Render
