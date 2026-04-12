import { isDeepStrictEqual } from 'node:util'
import {
	treeViewReducer,
	createDefaultTreeViewState,
	type TreeViewState,
	type TreeViewSelectionMode,
	type ITreeNode,
	type ITreeNodeState,
} from '@wolf-tui/shared'
import type { TreeViewVisibleNode } from '@wolf-tui/shared'

//#region Types
export type UseTreeViewStateProps<T = Record<string, unknown>> = {
	data: ITreeNode<T>[]
	selectionMode?: TreeViewSelectionMode
	defaultExpanded?: ReadonlySet<string> | 'all'
	defaultSelected?: ReadonlySet<string>
	visibleNodeCount?: number
	onSelect?: (selectedIds: ReadonlySet<string>) => void
	onExpand?: (nodeId: string) => void
	onCollapse?: (nodeId: string) => void
	onLoadChildren?: (nodeId: string) => void
}

export type TreeViewStateResult = {
	visibleNodes: () => TreeViewVisibleNode[]
	focusedId: () => string | undefined
	expandedIds: () => ReadonlySet<string>
	selectedIds: () => ReadonlySet<string>
	selectionMode: () => TreeViewSelectionMode
	hasScrollUp: () => boolean
	hasScrollDown: () => boolean
	scrollUpCount: () => number
	scrollDownCount: () => number
	focusNext: () => void
	focusPrevious: () => void
	focusFirst: () => void
	focusLast: () => void
	expand: () => void
	collapse: () => void
	toggleExpand: () => void
	expandAll: () => void
	collapseAll: () => void
	select: () => void
	focusParent: () => void
	focusFirstChild: () => void
}
//#endregion Types

//#region Composable
export const useTreeViewState = <T = Record<string, unknown>>({
	data,
	selectionMode = 'none',
	defaultExpanded,
	defaultSelected,
	visibleNodeCount = 10,
	onSelect,
	onExpand,
	onCollapse,
	onLoadChildren,
}: UseTreeViewStateProps<T>): TreeViewStateResult => {
	const initial = createDefaultTreeViewState({
		data,
		selectionMode,
		defaultExpanded,
		defaultSelected,
		visibleNodeCount,
	})

	let _state = $state<TreeViewState<T>>(initial)

	// Reset state when data changes
	let _lastData = data

	$effect(() => {
		const currentData = data
		if (
			currentData !== _lastData &&
			!isDeepStrictEqual(currentData, _lastData)
		) {
			_state = createDefaultTreeViewState({
				data: currentData,
				selectionMode,
				defaultExpanded,
				defaultSelected,
				visibleNodeCount,
			})
			_lastData = currentData
		}
	})

	const dispatch = (action: Parameters<typeof treeViewReducer<T>>[1]) => {
		const prevState = _state
		_state = treeViewReducer(_state, action)

		if (prevState.selectedIds !== _state.selectedIds) {
			onSelect?.(_state.selectedIds)
		}
	}

	const visibleNodes = (): TreeViewVisibleNode[] => {
		const { fromIndex, toIndex } = _state.viewport
		return _state.flatNodes.slice(fromIndex, toIndex).map((flat) => {
			const nodeState: ITreeNodeState = {
				isFocused: flat.node.id === _state.focusedId,
				isExpanded: _state.expandedIds.has(flat.node.id),
				isSelected: _state.selectedIds.has(flat.node.id),
				isLoading: _state.loadingIds.has(flat.node.id),
				hasChildren: flat.hasChildren,
				depth: flat.depth,
			}
			return {
				id: flat.node.id,
				label: flat.node.label,
				state: nodeState,
			}
		})
	}

	const focusedId = () => _state.focusedId
	const expandedIds = () => _state.expandedIds
	const selectedIds = () => _state.selectedIds
	const selectionModeAccessor = () => _state.selectionMode

	const hasScrollUp = () => _state.viewport.fromIndex > 0
	const hasScrollDown = () => _state.viewport.toIndex < _state.flatNodes.length
	const scrollUpCount = () => _state.viewport.fromIndex
	const scrollDownCount = () =>
		_state.flatNodes.length - _state.viewport.toIndex

	const focusNext = () => dispatch({ type: 'focus-next' })
	const focusPrevious = () => dispatch({ type: 'focus-previous' })
	const focusFirst = () => dispatch({ type: 'focus-first' })
	const focusLast = () => dispatch({ type: 'focus-last' })

	const expand = () => {
		const prevExpanded = _state.expandedIds
		const focId = _state.focusedId

		// Check for lazy-loading: if node is a parent with no loaded children
		if (focId !== undefined) {
			const flat = _state.flatNodes.find((n) => n.node.id === focId)
			if (
				flat &&
				flat.node.isParent === true &&
				(!flat.node.children || flat.node.children.length === 0)
			) {
				onLoadChildren?.(focId)
				return
			}
		}

		dispatch({ type: 'expand' })

		if (
			focId !== undefined &&
			!prevExpanded.has(focId) &&
			_state.expandedIds.has(focId)
		) {
			onExpand?.(focId)
		}
	}

	const collapse = () => {
		const focId = _state.focusedId
		const wasExpanded = focId !== undefined && _state.expandedIds.has(focId)

		dispatch({ type: 'collapse' })

		if (wasExpanded && focId !== undefined && !_state.expandedIds.has(focId)) {
			onCollapse?.(focId)
		}
	}

	const toggleExpand = () => dispatch({ type: 'toggle-expand' })
	const expandAll = () => dispatch({ type: 'expand-all' })
	const collapseAll = () => dispatch({ type: 'collapse-all' })
	const select = () => dispatch({ type: 'select' })
	const focusParent = () => dispatch({ type: 'focus-parent' })
	const focusFirstChild = () => dispatch({ type: 'focus-first-child' })

	return {
		visibleNodes,
		focusedId,
		expandedIds,
		selectedIds,
		selectionMode: selectionModeAccessor,
		hasScrollUp,
		hasScrollDown,
		scrollUpCount,
		scrollDownCount,
		focusNext,
		focusPrevious,
		focusFirst,
		focusLast,
		expand,
		collapse,
		toggleExpand,
		expandAll,
		collapseAll,
		select,
		focusParent,
		focusFirstChild,
	}
}
//#endregion Composable
