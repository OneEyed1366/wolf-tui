import { useInput } from '../../hooks/use-input'
import type { IComboboxState } from './use-combobox-state'

//#region Types
export type IUseComboboxProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Combobox state from useComboboxState.
	 */
	state: IComboboxState
}
//#endregion Types

//#region Hook
export function useCombobox({
	isDisabled = false,
	state,
}: IUseComboboxProps): void {
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
				state.close()
				return
			}

			if (key.backspace) {
				state.inputDelete()
				return
			}

			if (key.delete || (key.ctrl && input === 'd')) {
				state.inputDeleteForward()
				return
			}

			if (key.leftArrow) {
				state.cursorLeft()
				return
			}

			if (key.rightArrow) {
				state.cursorRight()
				return
			}

			if (key.ctrl && input === 'a') {
				state.cursorStart()
				return
			}

			if (key.ctrl && input === 'e') {
				state.cursorEnd()
				return
			}

			// Printable characters
			if (input.length > 0 && !key.ctrl && !key.meta) {
				state.inputInsert(input)
			}
		},
		{ isActive: !isDisabled }
	)
}
//#endregion Hook
