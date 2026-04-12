import { isDeepStrictEqual } from 'node:util'
import { createSignal, createMemo, createEffect, on } from 'solid-js'
import {
	treeViewReducer,
	createDefaultTreeViewState,
	type TreeViewState,
	type TreeViewAction,
	type TreeViewSelectionMode,
	type ITreeNode,
	type ITreeNodeState,
} from '@wolf-tui/shared'
import type { TreeViewVisibleNode } from '@wolf-tui/shared'

//#region Types
export type UseTreeViewStateProps<T = Record<string, unknown>> = {
	/**
	 * Tree data.
	 */
	data: ITreeNode<T>[]

	/**
	 * Selection mode.
	 *
	 * @default 'none'
	 */
	selectionMode?: TreeViewSelectionMode

	/**
	 * Default expanded node IDs. Pass 'all' to expand everything.
	 */
	defaultExpanded?: ReadonlySet<string> | 'all'

	/**
	 * Default selected node IDs.
	 */
	defaultSelected?: ReadonlySet<string>

	/**
	 * Number of visible nodes in the viewport.
	 *
	 * @default Infinity
	 */
	visibleNodeCount?: number

	/**
	 * Called when selection changes.
	 */
	onSelect?: (selectedIds: ReadonlySet<string>) => void

	/**
	 * Called when a node is expanded. Useful for lazy-loading children.
	 */
	onExpand?: (nodeId: string) => void

	/**
	 * Called when a node is collapsed.
	 */
	onCollapse?: (nodeId: string) => void
}

export type TreeViewStateResult<T = Record<string, unknown>> = {
	visibleNodes: () => TreeViewVisibleNode[]
	selectionMode: () => TreeViewSelectionMode
	focusedId: () => string | undefined
	selectedIds: () => ReadonlySet<string>
	expandedIds: () => ReadonlySet<string>
	hasScrollUp: () => boolean
	hasScrollDown: () => boolean
	scrollUpCount: () => number
	scrollDownCount: () => number
	dispatch: (action: TreeViewAction<T>) => void
}
//#endregion Types

//#region Composable
export const useTreeViewState = <T = Record<string, unknown>>({
	data,
	selectionMode = 'none',
	defaultExpanded,
	defaultSelected,
	visibleNodeCount,
	onSelect,
	onExpand,
	onCollapse,
}: UseTreeViewStateProps<T>): TreeViewStateResult<T> => {
	const initialState = createDefaultTreeViewState({
		data,
		selectionMode,
		defaultExpanded,
		defaultSelected,
		visibleNodeCount,
	})

	const [state, setState] = createSignal<TreeViewState<T>>(initialState)

	const dispatch = (action: TreeViewAction<T>) => {
		setState((prev) => {
			const next = treeViewReducer(prev, action)

			// Detect expand
			if (
				action.type === 'expand' ||
				action.type === 'toggle-expand' ||
				action.type === 'expand-node'
			) {
				for (const id of next.expandedIds) {
					if (!prev.expandedIds.has(id)) {
						onExpand?.(id)
					}
				}
			}

			// Detect collapse
			if (
				action.type === 'collapse' ||
				action.type === 'toggle-expand' ||
				action.type === 'collapse-node' ||
				action.type === 'collapse-all'
			) {
				for (const id of prev.expandedIds) {
					if (!next.expandedIds.has(id)) {
						onCollapse?.(id)
					}
				}
			}

			return next
		})
	}

	// Reset state when data changes
	const [lastData, setLastData] = createSignal(data)

	createEffect(
		on(
			() => JSON.stringify(data),
			() => {
				if (!isDeepStrictEqual(data, lastData())) {
					setState(
						createDefaultTreeViewState({
							data,
							selectionMode,
							defaultExpanded,
							defaultSelected,
							visibleNodeCount,
						})
					)
					setLastData(data)
				}
			},
			{ defer: true }
		)
	)

	// Watch selectedIds for onSelect callback
	createEffect(
		on(
			() => state().selectedIds,
			(ids, prevIds) => {
				if (ids !== prevIds) {
					onSelect?.(ids)
				}
			},
			{ defer: true }
		)
	)

	const visibleNodes = createMemo((): TreeViewVisibleNode[] => {
		const s = state()
		const {
			flatNodes,
			viewport,
			expandedIds: expanded,
			selectedIds: selected,
			focusedId: focused,
			loadingIds,
		} = s
		const fromIndex = viewport.fromIndex
		const toIndex = viewport.toIndex

		const nodes: TreeViewVisibleNode[] = []

		for (let i = fromIndex; i < toIndex && i < flatNodes.length; i++) {
			const flat = flatNodes[i]!
			const nodeState: ITreeNodeState = {
				depth: flat.depth,
				isExpanded: expanded.has(flat.node.id),
				isFocused: flat.node.id === focused,
				isSelected: selected.has(flat.node.id),
				hasChildren: flat.hasChildren,
				isLoading: loadingIds.has(flat.node.id),
			}

			nodes.push({
				id: flat.node.id,
				label: flat.node.label,
				state: nodeState,
			})
		}

		return nodes
	})

	const focusedId = createMemo(() => state().focusedId)
	const selectedIds = createMemo(() => state().selectedIds)
	const expandedIds = createMemo(() => state().expandedIds)
	const selectionModeSignal = createMemo(() => state().selectionMode)

	const hasScrollUp = createMemo(() => state().viewport.fromIndex > 0)
	const hasScrollDown = createMemo(() => {
		const s = state()
		return s.viewport.toIndex < s.flatNodes.length
	})
	const scrollUpCount = createMemo(() => state().viewport.fromIndex)
	const scrollDownCount = createMemo(() => {
		const s = state()
		return Math.max(0, s.flatNodes.length - s.viewport.toIndex)
	})

	return {
		visibleNodes,
		selectionMode: selectionModeSignal,
		focusedId,
		selectedIds,
		expandedIds,
		hasScrollUp,
		hasScrollDown,
		scrollUpCount,
		scrollDownCount,
		dispatch,
	}
}
//#endregion Composable
