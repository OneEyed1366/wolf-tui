import { wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { TextInputViewState } from './view-states'

//#region Theme
export type TextInputRenderTheme = {
	styles: {
		value: () => WNodeProps
	}
}

export const defaultTextInputTheme: TextInputRenderTheme = {
	styles: {
		value: (): WNodeProps => ({}),
	},
}
//#endregion Theme

//#region Render
export function renderTextInput(
	state: TextInputViewState,
	theme: TextInputRenderTheme = defaultTextInputTheme
): WNode {
	return wtext(theme.styles.value(), [state.inputValue])
}
//#endregion Render
