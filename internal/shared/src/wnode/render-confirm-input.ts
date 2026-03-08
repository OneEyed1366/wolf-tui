import { wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { ConfirmInputViewState } from './view-states'

//#region Theme
export type ConfirmInputRenderTheme = {
	styles: {
		input: (props: { isFocused: boolean }) => WNodeProps
	}
}

export const defaultConfirmInputTheme: ConfirmInputRenderTheme = {
	styles: {
		input: ({ isFocused }): WNodeProps => ({
			style: { color: isFocused ? undefined : 'gray' },
		}),
	},
}
//#endregion Theme

//#region Render
export function renderConfirmInput(
	state: ConfirmInputViewState,
	theme: ConfirmInputRenderTheme = defaultConfirmInputTheme
): WNode {
	const { defaultChoice, isDisabled } = state
	const { styles } = theme

	return wtext(styles.input({ isFocused: !isDisabled }), [
		defaultChoice === 'confirm' ? 'Y/n' : 'y/N',
	])
}
//#endregion Render
