import { createMemo } from 'solid-js'
import { useInput } from './use-input'
import type { ComboboxStateResult } from './use-combobox-state'

//#region Types
export type UseComboboxProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: () => boolean | undefined

	/**
	 * Combobox state.
	 */
	state: ComboboxStateResult
}
//#endregion Types

//#region Composable
export const useCombobox = ({ isDisabled, state }: UseComboboxProps) => {
	const isActive = createMemo(() => !(isDisabled?.() ?? false))

	useInput(
		(input, key) => {
			if (key.downArrow) {
				state.dispatch({ type: 'focus-next-option' })
				return
			}

			if (key.upArrow) {
				state.dispatch({ type: 'focus-previous-option' })
				return
			}

			if (key.return) {
				state.dispatch({ type: 'select-focused' })
				return
			}

			if (key.tab) {
				state.dispatch({ type: 'autofill-focused' })
				return
			}

			if (key.escape) {
				if (state.isOpen() || state.inputValue().length > 0) {
					state.dispatch({ type: 'close' })
					return
				}
			}

			if (key.delete || key.backspace) {
				state.dispatch({ type: 'input-delete' })
				return
			}

			if (key.leftArrow) {
				if (key.ctrl) {
					state.dispatch({ type: 'cursor-start' })
				} else {
					state.dispatch({ type: 'cursor-left' })
				}
				return
			}

			if (key.rightArrow) {
				if (key.ctrl) {
					state.dispatch({ type: 'cursor-end' })
				} else {
					state.dispatch({ type: 'cursor-right' })
				}
				return
			}

			// Regular character input
			if (input && !key.ctrl && !key.meta) {
				state.dispatch({ type: 'input-insert', text: input })
			}
		},
		{ isActive }
	)
}
//#endregion Composable
