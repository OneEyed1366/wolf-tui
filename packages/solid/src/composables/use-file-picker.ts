import { createMemo } from 'solid-js'
import { useInput } from './use-input'
import type { FilePickerStateResult } from './use-file-picker-state'

//#region Types
export type UseFilePickerProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: () => boolean | undefined

	/**
	 * Callback on cancel (Escape in browse mode).
	 */
	onCancel?: () => void

	/**
	 * FilePicker state.
	 */
	state: FilePickerStateResult
}
//#endregion Types

//#region Composable
export const useFilePicker = ({
	isDisabled,
	onCancel,
	state,
}: UseFilePickerProps) => {
	const isActive = createMemo(() => !(isDisabled?.() ?? false))

	useInput(
		(input, key) => {
			const mode = state.mode()

			// Filter mode: intercept text input
			if (mode === 'filtering') {
				if (key.escape) {
					state.dispatch({ type: 'exit-filter-mode' })
					return
				}

				if (key.return) {
					state.dispatch({ type: 'select' })
					state.dispatch({ type: 'exit-filter-mode' })
					return
				}

				if (key.delete || key.backspace) {
					state.dispatch({ type: 'filter-delete' })
					return
				}

				if (key.downArrow) {
					state.dispatch({ type: 'focus-next' })
					return
				}

				if (key.upArrow) {
					state.dispatch({ type: 'focus-previous' })
					return
				}

				// Regular character input for filter
				if (input && !key.ctrl && !key.meta) {
					state.dispatch({ type: 'filter-insert', text: input })
				}
				return
			}

			// Browsing mode
			if (key.downArrow) {
				state.dispatch({ type: 'focus-next' })
			}

			if (key.upArrow) {
				state.dispatch({ type: 'focus-previous' })
			}

			if (key.return) {
				state.dispatch({ type: 'select' })
			}

			if (key.escape) {
				onCancel?.()
				return
			}

			if (key.rightArrow) {
				state.dispatch({ type: 'enter-directory' })
			}

			if (key.leftArrow) {
				state.dispatch({ type: 'go-parent' })
			}

			// / to enter filter mode
			if (input === '/') {
				state.dispatch({ type: 'enter-filter-mode' })
			}

			// Space for toggle-select in multi-select mode
			if (input === ' ') {
				state.dispatch({ type: 'toggle-select' })
			}

			// g / G for first/last
			if (input === 'g') {
				state.dispatch({ type: 'focus-first' })
			}
			if (input === 'G') {
				state.dispatch({ type: 'focus-last' })
			}

			// r to retry on error
			if (mode === 'error' && (input === 'r' || input === 'R')) {
				state.dispatch({ type: 'retry' })
				state.loadDirectory(state.currentPath())
			}
		},
		{ isActive }
	)
}
//#endregion Composable
