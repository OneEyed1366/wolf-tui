import { useInput } from './use-input.js'
import type { TreeViewStateResult } from './use-tree-view-state.svelte.js'

//#region Types
export type UseTreeViewProps = {
	isDisabled?: () => boolean | undefined
	state: TreeViewStateResult
}
//#endregion Types

//#region Composable
export const useTreeView = ({ isDisabled, state }: UseTreeViewProps) => {
	const isActive = () => !(isDisabled?.() ?? false)

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

			if (key.return || _input === ' ') {
				state.select()
			}

			// Home key
			if (_input === 'g') {
				state.focusFirst()
			}

			// End key
			if (_input === 'G') {
				state.focusLast()
			}

			// Expand all
			if (_input === 'e') {
				state.expandAll()
			}

			// Collapse all
			if (_input === 'c') {
				state.collapseAll()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
