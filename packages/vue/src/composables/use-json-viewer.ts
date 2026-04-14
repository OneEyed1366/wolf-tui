import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { resolvePathValue } from '@wolf-tui/shared'
import { useInput } from './use-input'
import type { IJsonViewerState } from './use-json-viewer-state'

//#region Types
export interface IUseJsonViewerProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: MaybeRefOrGetter<boolean | undefined>

	/**
	 * Callback when a node is selected via Enter.
	 */
	onSelect?: (path: string, value: unknown) => void

	/**
	 * Json viewer state.
	 */
	state: IJsonViewerState
}
//#endregion Types

//#region Composable
export const useJsonViewer = ({
	isDisabled = false,
	onSelect,
	state,
}: IUseJsonViewerProps) => {
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
				const focused = state.nodes.value[state.focusedIndex.value]
				if (focused) {
					state.toggleExpand()
					const actualValue = resolvePathValue(state.data, focused.id)
					onSelect?.(focused.id, actualValue)
				}
				return
			}

			// Space: toggle expand
			if (_input === ' ') {
				state.toggleExpand()
			}

			// g: focus first
			if (_input === 'g') {
				state.focusFirst()
			}

			// G: focus last
			if (_input === 'G') {
				state.focusLast()
			}

			// e: expand all
			if (_input === 'e') {
				state.expandAll()
			}

			// c: collapse all
			if (_input === 'c') {
				state.collapseAll()
			}

			// l: move to first child
			if (_input === 'l') {
				state.moveToFirstChild()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
