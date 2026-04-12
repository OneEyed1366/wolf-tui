import { useInput } from './use-input.js'
import type { ComboboxStateResult } from './use-combobox-state.svelte.js'

//#region Types
export type UseComboboxProps = {
	isDisabled?: () => boolean | undefined
	state: ComboboxStateResult
}
//#endregion Types

//#region Composable
export const useCombobox = ({ isDisabled, state }: UseComboboxProps) => {
	const isActive = () => !(isDisabled?.() ?? false)

	useInput(
		(input, key) => {
			if (key.downArrow) {
				state.focusNextOption()
				return
			}

			if (key.upArrow) {
				state.focusPreviousOption()
				return
			}

			if (key.return) {
				state.selectFocused()
				return
			}

			if (key.tab) {
				state.autofillFocused()
				return
			}

			if (key.escape) {
				if (state.isOpen() || state.inputValue().length > 0) {
					state.close()
					return
				}
			}

			if (key.backspace || key.delete) {
				state.deleteChar()
				return
			}

			if (key.leftArrow) {
				if (key.ctrl) {
					state.cursorStart()
				} else {
					state.cursorLeft()
				}
				return
			}

			if (key.rightArrow) {
				if (key.ctrl) {
					state.cursorEnd()
				} else {
					state.cursorRight()
				}
				return
			}

			// Regular character input
			if (input && !key.ctrl && !key.meta) {
				state.insertText(input)
			}
		},
		{ isActive }
	)
}
//#endregion Composable
