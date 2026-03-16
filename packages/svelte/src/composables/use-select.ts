import { useInput } from './use-input.js'
import type { SelectState } from './use-select-state.js'

//#region Types
export type UseSelectProps = {
	isDisabled?: () => boolean | undefined
	state: SelectState
}
//#endregion Types

//#region Composable
export const useSelect = ({ isDisabled, state }: UseSelectProps) => {
	const isActive = () => !(isDisabled?.() ?? false)

	useInput(
		(_input, key) => {
			if (key.downArrow) {
				state.focusNextOption()
			}

			if (key.upArrow) {
				state.focusPreviousOption()
			}

			if (key.return) {
				state.selectFocusedOption()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
