import { useInput } from './use-input.js'
import type { FilePickerStateResult } from './use-file-picker-state.svelte.js'

//#region Types
export type UseFilePickerProps = {
	isDisabled?: () => boolean | undefined
	onCancel?: () => void
	state: FilePickerStateResult
}
//#endregion Types

//#region Composable
export const useFilePicker = ({
	isDisabled,
	onCancel,
	state,
}: UseFilePickerProps) => {
	const isActive = () => !(isDisabled?.() ?? false)

	useInput(
		(input, key) => {
			const mode = state.mode()

			// Filter mode: handle text input and navigation within filter
			if (mode === 'filtering') {
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

				// Regular text input for filter
				if (input && !key.ctrl && !key.meta) {
					state.filterInsert(input)
				}
				return
			}

			// Browsing mode
			if (key.downArrow) {
				state.focusNext()
			}

			if (key.upArrow) {
				state.focusPrevious()
			}

			if (key.return) {
				state.select()
			}

			if (key.escape) {
				onCancel?.()
				return
			}

			if (key.rightArrow) {
				state.enterDirectory()
			}

			if (key.leftArrow) {
				state.goParent()
			}

			if (input === ' ') {
				state.toggleSelect()
			}

			// Home
			if (input === 'g') {
				state.focusFirst()
			}

			// End
			if (input === 'G') {
				state.focusLast()
			}

			// Enter filter mode
			if (input === '/') {
				state.enterFilterMode()
			}

			// Retry on error
			if (input === 'r' && mode === 'error') {
				state.retry()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
