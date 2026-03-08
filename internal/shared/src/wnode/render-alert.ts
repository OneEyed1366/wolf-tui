import figures from 'figures'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { AlertVariant, AlertViewState } from './view-states'

//#region Theme
export type AlertRenderTheme = {
	styles: {
		container: (props: { variant: AlertVariant }) => WNodeProps
		iconContainer: () => WNodeProps
		icon: (props: { variant: AlertVariant }) => WNodeProps
		content: () => WNodeProps
		title: () => WNodeProps
		message: () => WNodeProps
	}
	config: (props: { variant: AlertVariant }) => { icon: string }
}

const colorByVariant: Record<AlertVariant, string> = {
	info: 'blue',
	success: 'green',
	error: 'red',
	warning: 'yellow',
}

const iconByVariant: Record<AlertVariant, string> = {
	info: figures.info,
	success: figures.tick,
	error: figures.cross,
	warning: figures.warning,
}

export const defaultAlertTheme: AlertRenderTheme = {
	styles: {
		container: ({ variant }): WNodeProps => ({
			style: {
				flexGrow: 1,
				borderStyle: 'round',
				borderColor: colorByVariant[variant],
				gap: 1,
				paddingX: 1,
			},
		}),
		iconContainer: (): WNodeProps => ({ style: { flexShrink: 0 } }),
		icon: ({ variant }): WNodeProps => ({
			style: { color: colorByVariant[variant] },
		}),
		content: (): WNodeProps => ({
			style: {
				flexShrink: 1,
				flexGrow: 1,
				minWidth: 0,
				flexDirection: 'column',
				gap: 1,
			},
		}),
		title: (): WNodeProps => ({ style: { fontWeight: 'bold' } }),
		message: (): WNodeProps => ({}),
	},
	config: ({ variant }) => ({ icon: iconByVariant[variant] }),
}
//#endregion Theme

//#region Render
export function renderAlert(
	state: AlertViewState,
	theme: AlertRenderTheme = defaultAlertTheme
): WNode {
	const { variant, title, message } = state
	const { styles, config } = theme

	const contentChildren: Array<WNode | string> = []
	if (title) {
		contentChildren.push(wtext(styles.title(), [title]))
	}
	contentChildren.push(wtext(styles.message(), [message]))

	return wbox(styles.container({ variant }), [
		wbox(styles.iconContainer(), [
			wtext(styles.icon({ variant }), [config({ variant }).icon]),
		]),
		wbox(styles.content(), contentChildren),
	])
}
//#endregion Render
