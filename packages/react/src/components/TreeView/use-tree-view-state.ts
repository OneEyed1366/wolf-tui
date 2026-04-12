import { isDeepStrictEqual } from 'node:util'
import {
	useReducer,
	useCallback,
	useMemo,
	useEffect,
	useRef,
	useState,
} from 'react'
import {
	treeViewReducer,
	createDefaultTreeViewState,
	type TreeViewState,
	type TreeViewAction,
	type TreeViewSelectionMode,
	type ITreeNode,
	type IFlatTreeNode,
} from '@wolf-tui/shared'

//#region Types
export type IUseTreeViewStateProps<T = Record<string, unknown>> = {
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
	 * IDs of nodes expanded by default, or 'all'.
	 */
	defaultExpanded?: ReadonlySet<string> | 'all'

	/**
	 * IDs of nodes selected by default.
	 */
	defaultSelected?: ReadonlySet<string>

	/**
	 * Number of visible nodes in the viewport.
	 */
	visibleNodeCount?: number

	/**
	 * Callback when focused node changes.
	 */
	onFocusChange?: (nodeId: string) => void

	/**
	 * Callback when expanded set changes.
	 */
	onExpandChange?: (expandedIds: ReadonlySet<string>) => void

	/**
	 * Callback when selected set changes.
	 */
	onSelectChange?: (selectedIds: ReadonlySet<string>) => void
}

export type ITreeViewState<T = Record<string, unknown>> = {
	focusedId: string | undefined
	expandedIds: ReadonlySet<string>
	selectedIds: ReadonlySet<string>
	loadingIds: ReadonlySet<string>
	flatNodes: IFlatTreeNode<T>[]
	viewportFrom: number
	viewportTo: number
	visibleNodes: IFlatTreeNode<T>[]

	focusNext: () => void
	focusPrevious: () => void
	focusFirst: () => void
	focusLast: () => void
	expand: () => void
	collapse: () => void
	toggleExpand: () => void
	select: () => void
	focusParent: () => void
	focusFirstChild: () => void
	setLoading: (nodeId: string, isLoading: boolean) => void
	setChildren: (nodeId: string, children: ITreeNode<T>[]) => void
	expandNode: (nodeId: string) => void
}
//#endregion Types

//#region Hook
export function useTreeViewState<T = Record<string, unknown>>({
	data,
	selectionMode = 'none',
	defaultExpanded,
	defaultSelected,
	visibleNodeCount,
	onFocusChange,
	onExpandChange,
	onSelectChange,
}: IUseTreeViewStateProps<T>): ITreeViewState<T> {
	// Typed wrapper to preserve generic T through useReducer inference
	const typedReducer = treeViewReducer<T> satisfies (
		state: TreeViewState<T>,
		action: TreeViewAction<T>
	) => TreeViewState<T>

	const [state, dispatch] = useReducer(
		typedReducer,
		{ data, selectionMode, defaultExpanded, defaultSelected, visibleNodeCount },
		createDefaultTreeViewState<T>
	)

	// Reset state when data changes
	const [lastData, setLastData] = useState(data)

	if (data !== lastData && !isDeepStrictEqual(data, lastData)) {
		dispatch({
			type: 'reset',
			state: createDefaultTreeViewState<T>({
				data,
				selectionMode,
				defaultExpanded,
				defaultSelected,
				visibleNodeCount,
			}),
		})
		setLastData(data)
	}

	const prevFocusedIdRef = useRef(state.focusedId)
	const prevExpandedRef = useRef(state.expandedIds)
	const prevSelectedRef = useRef(state.selectedIds)

	// onFocusChange callback
	useEffect(() => {
		if (
			state.focusedId !== prevFocusedIdRef.current &&
			state.focusedId !== undefined
		) {
			prevFocusedIdRef.current = state.focusedId
			onFocusChange?.(state.focusedId)
		}
	}, [state.focusedId, onFocusChange])

	// onExpandChange callback
	useEffect(() => {
		if (state.expandedIds !== prevExpandedRef.current) {
			prevExpandedRef.current = state.expandedIds
			onExpandChange?.(state.expandedIds)
		}
	}, [state.expandedIds, onExpandChange])

	// onSelectChange callback
	useEffect(() => {
		if (state.selectedIds !== prevSelectedRef.current) {
			prevSelectedRef.current = state.selectedIds
			onSelectChange?.(state.selectedIds)
		}
	}, [state.selectedIds, onSelectChange])

	const focusNext = useCallback(() => {
		dispatch({ type: 'focus-next' })
	}, [])

	const focusPrevious = useCallback(() => {
		dispatch({ type: 'focus-previous' })
	}, [])

	const focusFirst = useCallback(() => {
		dispatch({ type: 'focus-first' })
	}, [])

	const focusLast = useCallback(() => {
		dispatch({ type: 'focus-last' })
	}, [])

	const expand = useCallback(() => {
		dispatch({ type: 'expand' })
	}, [])

	const collapse = useCallback(() => {
		dispatch({ type: 'collapse' })
	}, [])

	const toggleExpand = useCallback(() => {
		dispatch({ type: 'toggle-expand' })
	}, [])

	const selectAction = useCallback(() => {
		dispatch({ type: 'select' })
	}, [])

	const focusParent = useCallback(() => {
		dispatch({ type: 'focus-parent' })
	}, [])

	const focusFirstChild = useCallback(() => {
		dispatch({ type: 'focus-first-child' })
	}, [])

	const setLoading = useCallback((nodeId: string, isLoading: boolean) => {
		dispatch({ type: 'set-loading', nodeId, isLoading })
	}, [])

	const setChildren = useCallback(
		(nodeId: string, children: ITreeNode<T>[]) => {
			dispatch({ type: 'set-children', nodeId, children })
		},
		[]
	)

	const expandNode = useCallback((nodeId: string) => {
		dispatch({ type: 'expand-node', nodeId })
	}, [])

	const visibleNodes = useMemo(() => {
		return state.flatNodes.slice(
			state.viewport.fromIndex,
			state.viewport.toIndex
		)
	}, [state.flatNodes, state.viewport.fromIndex, state.viewport.toIndex])

	return {
		focusedId: state.focusedId,
		expandedIds: state.expandedIds,
		selectedIds: state.selectedIds,
		loadingIds: state.loadingIds,
		flatNodes: state.flatNodes,
		viewportFrom: state.viewport.fromIndex,
		viewportTo: state.viewport.toIndex,
		visibleNodes,
		focusNext,
		focusPrevious,
		focusFirst,
		focusLast,
		expand,
		collapse,
		toggleExpand,
		select: selectAction,
		focusParent,
		focusFirstChild,
		setLoading,
		setChildren,
		expandNode,
	}
}
//#endregion Hook
