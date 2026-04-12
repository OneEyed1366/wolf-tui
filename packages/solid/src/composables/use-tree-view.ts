import { createMemo } from 'solid-js'
import { useInput } from './use-input'
import type { TreeViewStateResult } from './use-tree-view-state'

//#region Types
export type UseTreeViewProps<T = Record<string, unknown>> = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: () => boolean | undefined

	/**
	 * TreeView state.
	 */
	state: TreeViewStateResult<T>
}
//#endregion Types

//#region Composable
export const useTreeView = <T = Record<string, unknown>>({
	isDisabled,
	state,
}: UseTreeViewProps<T>) => {
	const isActive = createMemo(() => !(isDisabled?.() ?? false))

	useInput(
		(_input, key) => {
			if (key.downArrow) {
				state.dispatch({ type: 'focus-next' })
			}

			if (key.upArrow) {
				state.dispatch({ type: 'focus-previous' })
			}

			if (key.rightArrow) {
				state.dispatch({ type: 'expand' })
			}

			if (key.leftArrow) {
				state.dispatch({ type: 'collapse' })
			}

			if (key.return) {
				state.dispatch({ type: 'select' })
			}

			// Home/End for first/last
			if (_input === 'g') {
				state.dispatch({ type: 'focus-first' })
			}
			if (_input === 'G') {
				state.dispatch({ type: 'focus-last' })
			}
		},
		{ isActive }
	)
}
//#endregion Composable
