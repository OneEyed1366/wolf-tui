import { isDeepStrictEqual } from 'node:util'
import { ref, computed, watch, type ComputedRef, type Ref } from 'vue'
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
export interface IUseTreeViewStateProps {
	/**
	 * Tree data.
	 */
	data: ITreeNode[]

	/**
	 * Selection mode.
	 *
	 * @default 'none'
	 */
	selectionMode?: TreeViewSelectionMode

	/**
	 * Default expanded node IDs.
	 */
	defaultExpanded?: ReadonlySet<string> | 'all'

	/**
	 * Default selected node IDs.
	 */
	defaultSelected?: ReadonlySet<string>

	/**
	 * Number of visible nodes.
	 *
	 * @default Infinity
	 */
	visibleNodeCount?: number

	/**
	 * Callback when selection changes.
	 */
	onSelect?: (selectedIds: ReadonlySet<string>) => void

	/**
	 * Callback when focused node changes.
	 */
	onFocusChange?: (focusedId: string | undefined) => void

	/**
	 * Callback to load children for a node (async tree).
	 */
	loadChildren?: (nodeId: string) => Promise<ITreeNode[]>
}

export interface ITreeViewState {
	viewportNodes: ComputedRef<TreeViewVisibleNode[]>
	selectionMode: TreeViewSelectionMode
	focusedId: ComputedRef<string | undefined>
	selectedIds: ComputedRef<ReadonlySet<string>>
	hasScrollUp: ComputedRef<boolean>
	hasScrollDown: ComputedRef<boolean>
	scrollUpCount: ComputedRef<number>
	scrollDownCount: ComputedRef<number>
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
export const useTreeViewState = ({
	data,
	selectionMode = 'none',
	defaultExpanded,
	defaultSelected,
	visibleNodeCount,
	onSelect,
	onFocusChange,
	loadChildren,
}: IUseTreeViewStateProps): ITreeViewState => {
	const initialState = createDefaultTreeViewState({
		data,
		selectionMode,
		defaultExpanded,
		defaultSelected,
		visibleNodeCount,
	})

	// Use shallowRef-like pattern: store state as opaque value.
	// Cast-free approach: the ref wraps TreeViewState<Record<string, unknown>>
	// which satisfies UnwrapRef since Record<string, unknown> is already unwrapped.
	const state: Ref<TreeViewState> = ref(initialState)

	//#region Derived State
	const focusedId = computed(() => state.value.focusedId)
	const selectedIds = computed(() => state.value.selectedIds)

	const hasScrollUp = computed(() => state.value.viewport.fromIndex > 0)
	const hasScrollDown = computed(
		() => state.value.viewport.toIndex < state.value.flatNodes.length
	)
	const scrollUpCount = computed(() => state.value.viewport.fromIndex)
	const scrollDownCount = computed(
		() => state.value.flatNodes.length - state.value.viewport.toIndex
	)

	const viewportNodes = computed((): TreeViewVisibleNode[] => {
		const {
			flatNodes,
			viewport,
			expandedIds,
			selectedIds: selIds,
			focusedId: fId,
			loadingIds,
		} = state.value
		const visible = flatNodes.slice(viewport.fromIndex, viewport.toIndex)

		return visible.map((flat) => {
			const nodeState: ITreeNodeState = {
				isFocused: flat.node.id === fId,
				isExpanded: expandedIds.has(flat.node.id),
				isSelected: selIds.has(flat.node.id),
				isLoading: loadingIds.has(flat.node.id),
				hasChildren: flat.hasChildren,
				depth: flat.depth,
			}

			return {
				id: flat.node.id,
				label: flat.node.label,
				state: nodeState,
			}
		})
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
				state.value = createDefaultTreeViewState({
					data: newData,
					selectionMode,
					defaultExpanded,
					defaultSelected,
					visibleNodeCount,
				})
				lastData.value = newData
			}
		},
		{ deep: true }
	)

	watch(
		() => state.value.selectedIds,
		(newIds) => {
			onSelect?.(newIds)
		}
	)

	watch(
		() => state.value.focusedId,
		(newId) => {
			onFocusChange?.(newId)
		}
	)
	//#endregion Watchers

	//#region Actions
	const dispatch = (action: TreeViewAction) => {
		state.value = treeViewReducer(state.value, action)
	}

	const expand = () => {
		const fId = state.value.focusedId
		if (fId === undefined) return

		const flatNode = state.value.flatNodes.find((n) => n.node.id === fId)
		if (!flatNode) return

		// Async loading: isParent but no children loaded yet
		if (
			flatNode.node.isParent === true &&
			(!flatNode.node.children || flatNode.node.children.length === 0) &&
			loadChildren
		) {
			dispatch({ type: 'set-loading', nodeId: fId, isLoading: true })

			loadChildren(fId)
				.then((children) => {
					dispatch({ type: 'set-children', nodeId: fId, children })
					dispatch({ type: 'set-loading', nodeId: fId, isLoading: false })
					dispatch({ type: 'expand-node', nodeId: fId })
				})
				.catch(() => {
					dispatch({ type: 'set-loading', nodeId: fId, isLoading: false })
				})
			return
		}

		dispatch({ type: 'expand' })
	}
	//#endregion Actions

	return {
		viewportNodes,
		selectionMode,
		focusedId,
		selectedIds,
		hasScrollUp,
		hasScrollDown,
		scrollUpCount,
		scrollDownCount,
		focusNext: () => dispatch({ type: 'focus-next' }),
		focusPrevious: () => dispatch({ type: 'focus-previous' }),
		focusFirst: () => dispatch({ type: 'focus-first' }),
		focusLast: () => dispatch({ type: 'focus-last' }),
		expand,
		collapse: () => dispatch({ type: 'collapse' }),
		toggleExpand: () => dispatch({ type: 'toggle-expand' }),
		expandAll: () => dispatch({ type: 'expand-all' }),
		collapseAll: () => dispatch({ type: 'collapse-all' }),
		select: () => dispatch({ type: 'select' }),
		focusParent: () => dispatch({ type: 'focus-parent' }),
		focusFirstChild: () => dispatch({ type: 'focus-first-child' }),
	}
}
//#endregion Composable
