import figures from 'figures'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type {
	StatusMessageVariant,
	StatusMessageViewState,
} from './view-states'

//#region Theme
export type StatusMessageRenderTheme = {
	styles: {
		container: () => WNodeProps
		iconContainer: () => WNodeProps
		icon: (props: { variant: StatusMessageVariant }) => WNodeProps
		message: () => WNodeProps
	}
	config: (props: { variant: StatusMessageVariant }) => { icon: string }
}

const colorByVariant: Record<StatusMessageVariant, string> = {
	success: 'green',
	error: 'red',
	warning: 'yellow',
	info: 'blue',
}

const iconByVariant: Record<StatusMessageVariant, string> = {
	success: figures.tick,
	error: figures.cross,
	warning: figures.warning,
	info: figures.info,
}

export const defaultStatusMessageTheme: StatusMessageRenderTheme = {
	styles: {
		container: (): WNodeProps => ({ style: { gap: 1 } }),
		iconContainer: (): WNodeProps => ({ style: { flexShrink: 0 } }),
		icon: ({ variant }): WNodeProps => ({
			style: { color: colorByVariant[variant] },
		}),
		message: (): WNodeProps => ({}),
	},
	config: ({ variant }) => ({ icon: iconByVariant[variant] }),
}
//#endregion Theme

//#region Render
export function renderStatusMessage(
	state: StatusMessageViewState,
	theme: StatusMessageRenderTheme = defaultStatusMessageTheme
): WNode {
	const { variant, message } = state
	const { styles, config } = theme

	return wbox(styles.container(), [
		wbox(styles.iconContainer(), [
			wtext(styles.icon({ variant }), [config({ variant }).icon]),
		]),
		wtext(styles.message(), [message]),
	])
}
//#endregion Render
