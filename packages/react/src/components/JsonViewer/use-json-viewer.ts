import { resolvePathValue } from '@wolf-tui/shared'
import { useInput } from '../../hooks/use-input'
import type { IJsonViewerState } from './use-json-viewer-state'

//#region Types
export type IUseJsonViewerProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Callback when a node is selected via Enter.
	 */
	onSelect?: (path: string, value: unknown) => void

	/**
	 * JSON viewer state from useJsonViewerState.
	 */
	state: IJsonViewerState
}
//#endregion Types

//#region Hook
export function useJsonViewer({
	isDisabled = false,
	onSelect,
	state,
}: IUseJsonViewerProps): void {
	useInput(
		(input, key) => {
			if (key.downArrow) {
				state.focusNext()
				return
			}

			if (key.upArrow) {
				state.focusPrevious()
				return
			}

			if (key.rightArrow) {
				// If already expanded, move to first child; otherwise expand
				const focused = state.nodes[state.focusedIndex]
				if (focused && state.expandedIds.has(focused.id)) {
					state.moveToFirstChild()
				} else {
					state.expand()
				}
				return
			}

			if (key.leftArrow) {
				state.collapse()
				return
			}

			if (key.return) {
				// Toggle expand, and fire onSelect
				const focused = state.nodes[state.focusedIndex]
				if (focused) {
					state.toggleExpand()
					const actualValue = resolvePathValue(state.data, focused.id)
					onSelect?.(focused.id, actualValue)
				}
				return
			}

			if (input === ' ') {
				state.toggleExpand()
				return
			}

			if (input === 'g') {
				state.focusFirst()
				return
			}

			if (input === 'G') {
				state.focusLast()
				return
			}

			if (input === 'e' || input === '*') {
				state.expandAll()
				return
			}

			if (input === 'E' || input === '-') {
				state.collapseAll()
				return
			}
		},
		{ isActive: !isDisabled }
	)
}
//#endregion Hook
