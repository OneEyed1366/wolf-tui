import { createMemo } from 'solid-js'
import { resolvePathValue } from '@wolf-tui/shared'
import { useInput } from './use-input'
import type { JsonViewerStateResult } from './use-json-viewer-state'

//#region Types
export type UseJsonViewerProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: () => boolean | undefined

	/**
	 * Callback when a node is selected via Enter.
	 */
	onSelect?: (path: string, value: unknown) => void

	/**
	 * JsonViewer state.
	 */
	state: JsonViewerStateResult
}
//#endregion Types

//#region Composable
export const useJsonViewer = ({
	isDisabled,
	onSelect,
	state,
}: UseJsonViewerProps) => {
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
				const focused = state.nodes()[state.focusedIndex()]
				if (focused) {
					state.dispatch({ type: 'toggle-expand' })
					const actualValue = resolvePathValue(state.data, focused.id)
					onSelect?.(focused.id, actualValue)
				}
				return
			}

			// g / G for first/last
			if (_input === 'g') {
				state.dispatch({ type: 'focus-first' })
			}
			if (_input === 'G') {
				state.dispatch({ type: 'focus-last' })
			}

			// l for move to first child
			if (_input === 'l') {
				state.dispatch({ type: 'move-to-first-child' })
			}

			// e / E for expand/collapse all
			if (_input === 'e') {
				state.dispatch({ type: 'expand-all' })
			}
			if (_input === 'E') {
				state.dispatch({ type: 'collapse-all' })
			}
		},
		{ isActive }
	)
}
//#endregion Composable
