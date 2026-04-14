import { isDeepStrictEqual } from 'node:util'
import { createSignal, createMemo, createEffect, on } from 'solid-js'
import {
	jsonViewerReducer,
	createDefaultJsonViewerState,
	type JsonViewerState,
	type JsonViewerAction,
	type IJsonNode,
} from '@wolf-tui/shared'
import type { JsonViewerVisibleNode } from '@wolf-tui/shared'

//#region Types
export type UseJsonViewerStateProps = {
	/**
	 * Data to display. Can be any JSON-serializable value.
	 * Accepts an accessor so the composable re-tracks when the parent prop changes.
	 */
	data: () => unknown

	/**
	 * Default expand depth. Nodes at depth < this value are expanded on mount.
	 *
	 * @default 1
	 */
	defaultExpandDepth?: number

	/**
	 * Number of visible nodes in the viewport.
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
	 * Whether to sort object keys alphabetically.
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
}

export type JsonViewerStateResult = {
	data: unknown
	nodes: () => IJsonNode[]
	focusedIndex: () => number
	expandedIds: () => ReadonlySet<string>
	visibleNodes: () => JsonViewerVisibleNode[]
	hasScrollUp: () => boolean
	hasScrollDown: () => boolean
	indentWidth: () => number
	dispatch: (action: JsonViewerAction) => void
}
//#endregion Types

//#region Composable
export const useJsonViewerState = ({
	data: dataAccessor,
	defaultExpandDepth,
	visibleNodeCount,
	maxStringLength,
	sortKeys,
	maxDepth,
}: UseJsonViewerStateProps): JsonViewerStateResult => {
	const resolveData = (): unknown => dataAccessor()

	const initialState = createDefaultJsonViewerState({
		data: resolveData(),
		defaultExpandDepth,
		visibleNodeCount,
		maxStringLength,
		sortKeys,
		maxDepth,
	})

	const [state, setState] = createSignal<JsonViewerState>(initialState)

	const dispatch = (action: JsonViewerAction) => {
		setState((prev) => jsonViewerReducer(prev, action))
	}

	// Reset state when data changes
	const [lastData, setLastData] = createSignal(resolveData())

	createEffect(
		on(
			() => JSON.stringify(resolveData()),
			() => {
				const currentData = resolveData()
				if (!isDeepStrictEqual(currentData, lastData())) {
					setState(
						createDefaultJsonViewerState({
							data: currentData,
							defaultExpandDepth,
							visibleNodeCount,
							maxStringLength,
							sortKeys,
							maxDepth,
						})
					)
					setLastData(currentData)
				}
			},
			{ defer: true }
		)
	)

	const nodes = createMemo(() => state().nodes)
	const focusedIndex = createMemo(() => state().focusedIndex)
	const expandedIds = createMemo(() => state().expandedIds)

	const visibleNodes = createMemo((): JsonViewerVisibleNode[] => {
		const s = state()
		const { nodes, viewport, focusedIndex, expandedIds } = s
		const fromIndex = viewport.fromIndex
		const toIndex = viewport.toIndex

		const visible: JsonViewerVisibleNode[] = []
		for (let i = fromIndex; i < toIndex && i < nodes.length; i++) {
			const node = nodes[i]!
			visible.push({
				node,
				isFocused: i === focusedIndex,
				isExpanded: expandedIds.has(node.id),
			})
		}

		return visible
	})

	const hasScrollUp = createMemo(() => state().viewport.fromIndex > 0)
	const hasScrollDown = createMemo(() => {
		const s = state()
		return s.viewport.toIndex < s.nodes.length
	})

	const indentWidth = createMemo(() => 2)

	return {
		data: resolveData(),
		nodes,
		focusedIndex,
		expandedIds,
		visibleNodes,
		hasScrollUp,
		hasScrollDown,
		indentWidth,
		dispatch,
	}
}
//#endregion Composable
