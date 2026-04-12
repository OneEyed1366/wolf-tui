import { isDeepStrictEqual } from 'node:util'
import { ref, computed, watch, type ComputedRef } from 'vue'
import {
	jsonViewerReducer,
	createDefaultJsonViewerState,
	type JsonViewerAction,
	type IJsonNode,
} from '@wolf-tui/shared'
import type { JsonViewerVisibleNode } from '@wolf-tui/shared'

//#region Types
export interface IUseJsonViewerStateProps {
	/**
	 * JSON data to display.
	 */
	data: unknown

	/**
	 * Default depth to expand on mount.
	 *
	 * @default 1
	 */
	defaultExpandDepth?: number

	/**
	 * Number of visible rows.
	 *
	 * @default 20
	 */
	visibleNodeCount?: number

	/**
	 * Maximum string length before truncation.
	 *
	 * @default 120
	 */
	maxStringLength?: number

	/**
	 * Sort object keys alphabetically.
	 *
	 * @default false
	 */
	sortKeys?: boolean

	/**
	 * Maximum nesting depth.
	 *
	 * @default 100
	 */
	maxDepth?: number

	/**
	 * Indent width (spaces per depth level).
	 *
	 * @default 2
	 */
	indentWidth?: number

	/**
	 * Callback when focused node changes.
	 */
	onFocusChange?: (nodeId: string | undefined) => void
}

export interface IJsonViewerState {
	data: unknown
	nodes: ComputedRef<IJsonNode[]>
	focusedIndex: ComputedRef<number>
	expandedIds: ComputedRef<ReadonlySet<string>>
	visibleNodes: ComputedRef<JsonViewerVisibleNode[]>
	hasScrollUp: ComputedRef<boolean>
	hasScrollDown: ComputedRef<boolean>
	indentWidth: number
	focusNext: () => void
	focusPrevious: () => void
	focusFirst: () => void
	focusLast: () => void
	expand: () => void
	collapse: () => void
	toggleExpand: () => void
	expandAll: () => void
	collapseAll: () => void
	moveToFirstChild: () => void
}
//#endregion Types

//#region Composable
export const useJsonViewerState = ({
	data,
	defaultExpandDepth = 1,
	visibleNodeCount = 20,
	maxStringLength = 120,
	sortKeys = false,
	maxDepth = 100,
	indentWidth = 2,
	onFocusChange,
}: IUseJsonViewerStateProps): IJsonViewerState => {
	const initialState = createDefaultJsonViewerState({
		data,
		defaultExpandDepth,
		visibleNodeCount,
		maxStringLength,
		sortKeys,
		maxDepth,
	})

	const state = ref(initialState)

	//#region Derived State
	const nodes = computed(() => state.value.nodes)
	const focusedIndex = computed(() => state.value.focusedIndex)
	const expandedIds = computed(() => state.value.expandedIds)
	const hasScrollUp = computed(() => state.value.viewport.fromIndex > 0)
	const hasScrollDown = computed(
		() => state.value.viewport.toIndex < state.value.nodes.length
	)

	const visibleNodes = computed((): JsonViewerVisibleNode[] => {
		const { nodes, viewport, focusedIndex, expandedIds } = state.value
		const visible = nodes.slice(viewport.fromIndex, viewport.toIndex)

		return visible.map((node, idx) => ({
			node,
			isFocused: viewport.fromIndex + idx === focusedIndex,
			isExpanded: expandedIds.has(node.id),
		}))
	})
	//#endregion Derived State

	//#region Watchers
	// Reset state when data changes
	const lastData = ref(data)

	watch(
		() => data,
		(newData) => {
			if (
				newData !== lastData.value &&
				!isDeepStrictEqual(newData, lastData.value)
			) {
				state.value = createDefaultJsonViewerState({
					data: newData,
					defaultExpandDepth,
					visibleNodeCount,
					maxStringLength,
					sortKeys,
					maxDepth,
				})
				lastData.value = newData
			}
		},
		{ deep: true }
	)

	watch(
		() => {
			const focused = state.value.nodes[state.value.focusedIndex]
			return focused?.id
		},
		(newId) => {
			onFocusChange?.(newId)
		}
	)
	//#endregion Watchers

	//#region Actions
	const dispatch = (action: JsonViewerAction) => {
		state.value = jsonViewerReducer(state.value, action)
	}
	//#endregion Actions

	return {
		data,
		nodes,
		focusedIndex,
		expandedIds,
		visibleNodes,
		hasScrollUp,
		hasScrollDown,
		indentWidth,
		focusNext: () => dispatch({ type: 'focus-next' }),
		focusPrevious: () => dispatch({ type: 'focus-previous' }),
		focusFirst: () => dispatch({ type: 'focus-first' }),
		focusLast: () => dispatch({ type: 'focus-last' }),
		expand: () => dispatch({ type: 'expand' }),
		collapse: () => dispatch({ type: 'collapse' }),
		toggleExpand: () => dispatch({ type: 'toggle-expand' }),
		expandAll: () => dispatch({ type: 'expand-all' }),
		collapseAll: () => dispatch({ type: 'collapse-all' }),
		moveToFirstChild: () => dispatch({ type: 'move-to-first-child' }),
	}
}
//#endregion Composable
