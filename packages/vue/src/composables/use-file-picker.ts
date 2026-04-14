import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useInput } from './use-input'
import type { IFilePickerState } from './use-file-picker-state'

//#region Types
export interface IUseFilePickerProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: MaybeRefOrGetter<boolean | undefined>

	/**
	 * Callback on cancel (Escape in browse mode).
	 */
	onCancel?: () => void

	/**
	 * File picker state.
	 */
	state: IFilePickerState
}
//#endregion Types

//#region Composable
export const useFilePicker = ({
	isDisabled = false,
	onCancel,
	state,
}: IUseFilePickerProps) => {
	const isActive = computed(() => !toValue(isDisabled))

	useInput(
		(input, key) => {
			const isFilterMode = state.mode.value === 'filtering'

			// Filter mode: capture text input
			if (isFilterMode) {
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

				// Regular character input for filter
				if (input && !key.ctrl && !key.meta) {
					state.filterInsert(input)
				}
				return
			}

			// Browse mode
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

			if (key.escape) {
				onCancel?.()
				return
			}

			if (key.rightArrow) {
				state.enterDirectory()
				return
			}

			if (key.leftArrow) {
				state.goParent()
				return
			}

			// Space: toggle selection (multi-select mode)
			if (input === ' ') {
				state.toggleSelect()
				return
			}

			// /: enter filter mode
			if (input === '/') {
				state.enterFilterMode()
				return
			}

			// g: focus first
			if (input === 'g') {
				state.focusFirst()
				return
			}

			// G: focus last
			if (input === 'G') {
				state.focusLast()
				return
			}

			// r: retry on error
			if (input === 'r' && state.mode.value === 'error') {
				state.retry()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
