import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useInput } from './use-input'
import type { IComboboxState } from './use-combobox-state'

//#region Types
export interface IUseComboboxProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: MaybeRefOrGetter<boolean | undefined>

	/**
	 * Combobox state.
	 */
	state: IComboboxState
}
//#endregion Types

//#region Composable
export const useCombobox = ({
	isDisabled = false,
	state,
}: IUseComboboxProps) => {
	const isActive = computed(() => !toValue(isDisabled))

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

			if (key.backspace || key.delete) {
				state.deleteChar()
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

			// Ctrl+A: cursor to start
			if (input === '\x01') {
				state.cursorStart()
				return
			}

			// Ctrl+E: cursor to end
			if (input === '\x05') {
				state.cursorEnd()
				return
			}

			// Ctrl+D: delete forward
			if (input === '\x04') {
				state.deleteForward()
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
