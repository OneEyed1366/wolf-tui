import { isDeepStrictEqual } from 'node:util'
import {
	jsonViewerReducer,
	createDefaultJsonViewerState,
	type JsonViewerState,
	type IJsonNode,
} from '@wolf-tui/shared'
import type { JsonViewerVisibleNode } from '@wolf-tui/shared'

//#region Types
export type UseJsonViewerStateProps = {
	data: () => unknown
	defaultExpandDepth?: number
	visibleNodeCount?: number
	maxStringLength?: number
	sortKeys?: boolean
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

//#region Constants
const DEFAULT_INDENT_WIDTH = 2
//#endregion Constants

//#region Composable
export const useJsonViewerState = ({
	data: dataAccessor,
	defaultExpandDepth = 1,
	visibleNodeCount = 20,
	maxStringLength = 120,
	sortKeys = false,
	maxDepth = 100,
}: UseJsonViewerStateProps): JsonViewerStateResult => {
	const resolveData = (): unknown => dataAccessor()

	const initial = createDefaultJsonViewerState({
		data: resolveData(),
		defaultExpandDepth,
		visibleNodeCount,
		maxStringLength,
		sortKeys,
		maxDepth,
	})

	let _state = $state<JsonViewerState>(initial)

	// Reset state when data changes
	let _lastData = resolveData()

	$effect(() => {
		const currentData = resolveData()
		if (
			currentData !== _lastData &&
			!isDeepStrictEqual(currentData, _lastData)
		) {
			_state = createDefaultJsonViewerState({
				data: currentData,
				defaultExpandDepth,
				visibleNodeCount,
				maxStringLength,
				sortKeys,
				maxDepth,
			})
			_lastData = currentData
		}
	})

	const dispatch = (action: Parameters<typeof jsonViewerReducer>[1]) => {
		_state = jsonViewerReducer(_state, action)
	}

	const visibleNodes = (): JsonViewerVisibleNode[] => {
		const { fromIndex, toIndex } = _state.viewport
		return _state.nodes.slice(fromIndex, toIndex).map((node) => ({
			node,
			isFocused: _state.nodes.indexOf(node) === _state.focusedIndex,
			isExpanded: _state.expandedIds.has(node.id),
		}))
	}

	const nodes = () => _state.nodes
	const expandedIds = () => _state.expandedIds
	const hasScrollUp = () => _state.viewport.fromIndex > 0
	const hasScrollDown = () => _state.viewport.toIndex < _state.nodes.length
	const indentWidth = () => DEFAULT_INDENT_WIDTH
	const focusedIndex = () => _state.focusedIndex

	const focusNext = () => dispatch({ type: 'focus-next' })
	const focusPrevious = () => dispatch({ type: 'focus-previous' })
	const focusFirst = () => dispatch({ type: 'focus-first' })
	const focusLast = () => dispatch({ type: 'focus-last' })
	const expand = () => dispatch({ type: 'expand' })
	const collapse = () => dispatch({ type: 'collapse' })
	const toggleExpand = () => dispatch({ type: 'toggle-expand' })
	const expandAll = () => dispatch({ type: 'expand-all' })
	const collapseAll = () => dispatch({ type: 'collapse-all' })
	const moveToFirstChild = () => dispatch({ type: 'move-to-first-child' })

	return {
		data: resolveData(),
		nodes,
		focusedIndex,
		expandedIds,
		visibleNodes,
		hasScrollUp,
		hasScrollDown,
		indentWidth,
		focusNext,
		focusPrevious,
		focusFirst,
		focusLast,
		expand,
		collapse,
		toggleExpand,
		expandAll,
		collapseAll,
		moveToFirstChild,
	}
}
//#endregion Composable
