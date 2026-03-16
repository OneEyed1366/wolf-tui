import { useInput } from './use-input.js'
import type { MultiSelectState } from './use-multi-select-state.js'

//#region Types
export type UseMultiSelectProps = {
	isDisabled?: () => boolean | undefined
	state: MultiSelectState
}
//#endregion Types

//#region Composable
export const useMultiSelect = ({ isDisabled, state }: UseMultiSelectProps) => {
	const isActive = () => !(isDisabled?.() ?? false)

	useInput(
		(input, key) => {
			if (key.downArrow) {
				state.focusNextOption()
			}

			if (key.upArrow) {
				state.focusPreviousOption()
			}

			if (input === ' ') {
				state.toggleFocusedOption()
			}

			if (key.return) {
				state.submit()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
