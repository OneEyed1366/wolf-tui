import { useInput } from '../../hooks/use-input'
import type { IFilePickerState } from './use-file-picker-state'

//#region Types
export type IUseFilePickerProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Callback on cancel (Escape when not in filter mode).
	 */
	onCancel?: () => void

	/**
	 * File picker state from useFilePickerState.
	 */
	state: IFilePickerState
}
//#endregion Types

//#region Hook
export function useFilePicker({
	isDisabled = false,
	onCancel,
	state,
}: IUseFilePickerProps): void {
	useInput(
		(input, key) => {
			// Filter mode has its own key handling
			if (state.mode === 'filtering') {
				if (key.escape) {
					state.exitFilterMode()
					return
				}

				if (key.backspace || key.delete) {
					state.filterDelete()
					return
				}

				if (key.downArrow) {
					state.focusNext()
					return
				}

				if (key.upArrow) {
					state.focusPrevious()
					return
				}

				if (key.return) {
					state.select()
					return
				}

				// Printable chars in filter mode
				if (input.length > 0 && !key.ctrl && !key.meta) {
					state.filterInsert(input)
				}
				return
			}

			// Normal browsing mode
			if (key.downArrow) {
				state.focusNext()
				return
			}

			if (key.upArrow) {
				state.focusPrevious()
				return
			}

			if (key.return) {
				state.select()
				return
			}

			if (input === ' ') {
				state.toggleSelect()
				return
			}

			if (key.leftArrow) {
				state.goParent()
				return
			}

			if (key.rightArrow) {
				state.enterDirectory()
				return
			}

			if (input === '/') {
				state.enterFilterMode()
				return
			}

			if (key.escape) {
				onCancel?.()
				return
			}

			if (key.home) {
				state.focusFirst()
				return
			}

			if (key.end) {
				state.focusLast()
				return
			}
		},
		{ isActive: !isDisabled }
	)
}
//#endregion Hook
