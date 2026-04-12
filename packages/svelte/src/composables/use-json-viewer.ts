import { resolvePathValue } from '@wolf-tui/shared'
import { useInput } from './use-input.js'
import type { JsonViewerStateResult } from './use-json-viewer-state.svelte.js'

//#region Types
export type UseJsonViewerProps = {
	isDisabled?: () => boolean | undefined
	onSelect?: (path: string, value: unknown) => void
	state: JsonViewerStateResult
}
//#endregion Types

//#region Composable
export const useJsonViewer = ({
	isDisabled,
	onSelect,
	state,
}: UseJsonViewerProps) => {
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

			if (key.return) {
				const focused = state.nodes()[state.focusedIndex()]
				if (focused) {
					state.toggleExpand()
					const actualValue = resolvePathValue(state.data, focused.id)
					onSelect?.(focused.id, actualValue)
				}
				return
			}

			if (_input === ' ') {
				state.toggleExpand()
			}

			// Home
			if (_input === 'g') {
				state.focusFirst()
			}

			// End
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

			// Move to first child of expanded node
			if (_input === 'l') {
				state.moveToFirstChild()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
