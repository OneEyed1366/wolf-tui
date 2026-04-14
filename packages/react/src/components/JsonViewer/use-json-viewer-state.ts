import { isDeepStrictEqual } from 'node:util'
import {
	useReducer,
	useCallback,
	useMemo,
	useRef,
	useEffect,
	useState,
} from 'react'
import {
	jsonViewerReducer,
	createDefaultJsonViewerState,
	type IJsonNode,
} from '@wolf-tui/shared'

//#region Types
export type IUseJsonViewerStateProps = {
	/**
	 * Data to display.
	 */
	data: unknown

	/**
	 * Depth to expand by default.
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
	 * Sort object keys alphabetically.
	 *
	 * @default false
	 */
	sortKeys?: boolean

	/**
	 * Callback when a node is selected (Enter key).
	 */
	onSelect?: (path: string, value: unknown) => void
}

export type IJsonViewerState = {
	data: unknown
	nodes: IJsonNode[]
	focusedIndex: number
	expandedIds: ReadonlySet<string>
	viewportFrom: number
	viewportTo: number
	visibleNodes: IJsonNode[]

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

//#region Hook
export function useJsonViewerState({
	data,
	defaultExpandDepth = 1,
	visibleNodeCount = 20,
	maxStringLength = 120,
	sortKeys = false,
	onSelect: _onSelect,
}: IUseJsonViewerStateProps): IJsonViewerState {
	const [state, dispatch] = useReducer(
		jsonViewerReducer,
		{ data, defaultExpandDepth, visibleNodeCount, maxStringLength, sortKeys },
		createDefaultJsonViewerState
	)

	// Reset state when data changes
	const [lastData, setLastData] = useState(data)

	if (data !== lastData && !isDeepStrictEqual(data, lastData)) {
		dispatch({
			type: 'reset',
			state: createDefaultJsonViewerState({
				data,
				defaultExpandDepth,
				visibleNodeCount,
				maxStringLength,
				sortKeys,
			}),
		})
		setLastData(data)
	}

	const prevFocusedRef = useRef(state.focusedIndex)

	// Track focus changes for potential callback use
	useEffect(() => {
		prevFocusedRef.current = state.focusedIndex
	}, [state.focusedIndex])

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

	const expandAll = useCallback(() => {
		dispatch({ type: 'expand-all' })
	}, [])

	const collapseAll = useCallback(() => {
		dispatch({ type: 'collapse-all' })
	}, [])

	const moveToFirstChild = useCallback(() => {
		dispatch({ type: 'move-to-first-child' })
	}, [])

	const visibleNodes = useMemo(() => {
		return state.nodes.slice(state.viewport.fromIndex, state.viewport.toIndex)
	}, [state.nodes, state.viewport.fromIndex, state.viewport.toIndex])

	return {
		data: state.data,
		nodes: state.nodes,
		focusedIndex: state.focusedIndex,
		expandedIds: state.expandedIds,
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
		expandAll,
		collapseAll,
		moveToFirstChild,
	}
}
//#endregion Hook
