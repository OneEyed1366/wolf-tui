import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useInput } from './use-input'
import type { ITreeViewState } from './use-tree-view-state'

//#region Types
export interface IUseTreeViewProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: MaybeRefOrGetter<boolean | undefined>

	/**
	 * Tree view state.
	 */
	state: ITreeViewState
}
//#endregion Types

//#region Composable
export const useTreeView = ({
	isDisabled = false,
	state,
}: IUseTreeViewProps) => {
	const isActive = computed(() => !toValue(isDisabled))

	useInput(
		(_input, key) => {
			if (key.downArrow) {
				state.focusNext()
			}

			if (key.upArrow) {
				state.focusPrevious()
			}

			if (key.rightArrow) {
				state.expand()
			}

			if (key.leftArrow) {
				state.collapse()
			}

			if (key.return) {
				state.select()
			}

			// Space: toggle expand
			if (_input === ' ') {
				state.toggleExpand()
			}

			// Home: focus first
			if (_input === 'g') {
				state.focusFirst()
			}

			// End: focus last
			if (_input === 'G') {
				state.focusLast()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
