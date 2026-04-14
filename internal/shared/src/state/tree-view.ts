import {
	flattenTree,
	computeViewport,
	findParentId,
	findFirstChildId,
} from '../lib/tree-utils'
import type { ITreeNode, IFlatTreeNode, IViewport } from '../lib/tree-utils'

//#region Types
export type TreeViewSelectionMode = 'none' | 'single' | 'multiple'

export type TreeViewState<T = Record<string, unknown>> = {
	data: ITreeNode<T>[]
	selectionMode: TreeViewSelectionMode
	flatNodes: IFlatTreeNode<T>[]
	focusedId: string | undefined
	expandedIds: ReadonlySet<string>
	selectedIds: ReadonlySet<string>
	loadingIds: ReadonlySet<string>
	visibleNodeCount: number
	viewport: IViewport
}

export type TreeViewAction<T = Record<string, unknown>> =
	| { type: 'focus-next' }
	| { type: 'focus-previous' }
	| { type: 'focus-first' }
	| { type: 'focus-last' }
	| { type: 'expand' }
	| { type: 'collapse' }
	| { type: 'toggle-expand' }
	| { type: 'expand-all' }
	| { type: 'collapse-all' }
	| { type: 'select' }
	| { type: 'focus-parent' }
	| { type: 'focus-first-child' }
	| { type: 'set-loading'; nodeId: string; isLoading: boolean }
	| { type: 'set-children'; nodeId: string; children: ITreeNode<T>[] }
	| { type: 'expand-node'; nodeId: string }
	| { type: 'collapse-node'; nodeId: string }
	| { type: 'reset'; state: TreeViewState<T> }
//#endregion Types

//#region Helpers
function collectAllParentIds<T>(nodes: ITreeNode<T>[]): Set<string> {
	const ids = new Set<string>()

	for (const node of nodes) {
		const isParentNode =
			(node.children !== undefined && node.children.length > 0) ||
			node.isParent === true
		if (isParentNode) {
			ids.add(node.id)
		}
		if (node.children) {
			for (const childId of collectAllParentIds(node.children)) {
				ids.add(childId)
			}
		}
	}

	return ids
}

function isDescendantOf<T>(
	flatNodes: IFlatTreeNode<T>[],
	childId: string,
	ancestorId: string
): boolean {
	let currentParentId = flatNodes.find((n) => n.node.id === childId)?.parentId
	while (currentParentId !== undefined) {
		if (currentParentId === ancestorId) return true
		currentParentId = flatNodes.find(
			(n) => n.node.id === currentParentId
		)?.parentId
	}
	return false
}

function getFocusedIndex<T>(
	flatNodes: IFlatTreeNode<T>[],
	focusedId: string | undefined
): number {
	if (focusedId === undefined) return -1
	return flatNodes.findIndex((n) => n.node.id === focusedId)
}

function reflattenAndViewport<T>(
	state: TreeViewState<T>,
	expandedIds: ReadonlySet<string>,
	focusedId: string | undefined
): Pick<
	TreeViewState<T>,
	'flatNodes' | 'viewport' | 'expandedIds' | 'focusedId'
> {
	const flatNodes = flattenTree(state.data, expandedIds)
	const focusedIndex = getFocusedIndex(flatNodes, focusedId)
	const viewport = computeViewport(
		flatNodes.length,
		Math.max(0, focusedIndex),
		state.visibleNodeCount,
		state.viewport
	)

	return { flatNodes, viewport, expandedIds, focusedId }
}

function setChildrenInTree<T>(
	nodes: ITreeNode<T>[],
	nodeId: string,
	children: ITreeNode<T>[]
): ITreeNode<T>[] {
	return nodes.map((node) => {
		if (node.id === nodeId) {
			return { ...node, children }
		}

		if (node.children) {
			const updatedChildren = setChildrenInTree(node.children, nodeId, children)
			if (updatedChildren !== node.children) {
				return { ...node, children: updatedChildren }
			}
		}

		return node
	})
}
//#endregion Helpers

//#region Reducer
export function treeViewReducer<T>(
	state: TreeViewState<T>,
	action: TreeViewAction<T>
): TreeViewState<T> {
	switch (action.type) {
		case 'focus-next': {
			const currentIndex = getFocusedIndex(state.flatNodes, state.focusedId)
			if (currentIndex < 0 || currentIndex >= state.flatNodes.length - 1) {
				return state
			}

			const nextId = state.flatNodes[currentIndex + 1]!.node.id
			const viewport = computeViewport(
				state.flatNodes.length,
				currentIndex + 1,
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedId: nextId, viewport }
		}

		case 'focus-previous': {
			const currentIndex = getFocusedIndex(state.flatNodes, state.focusedId)
			if (currentIndex <= 0) {
				return state
			}

			const prevId = state.flatNodes[currentIndex - 1]!.node.id
			const viewport = computeViewport(
				state.flatNodes.length,
				currentIndex - 1,
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedId: prevId, viewport }
		}

		case 'focus-first': {
			if (state.flatNodes.length === 0) return state

			const firstId = state.flatNodes[0]!.node.id
			const viewport = computeViewport(
				state.flatNodes.length,
				0,
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedId: firstId, viewport }
		}

		case 'focus-last': {
			if (state.flatNodes.length === 0) return state

			const lastIndex = state.flatNodes.length - 1
			const lastId = state.flatNodes[lastIndex]!.node.id
			const viewport = computeViewport(
				state.flatNodes.length,
				lastIndex,
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedId: lastId, viewport }
		}

		case 'expand': {
			if (state.focusedId === undefined) return state

			if (state.expandedIds.has(state.focusedId)) return state

			const currentIndex = getFocusedIndex(state.flatNodes, state.focusedId)
			if (currentIndex < 0) return state

			const flat = state.flatNodes[currentIndex]!
			if (!flat.hasChildren) return state

			// isParent with no children loaded yet -- adapter handles async loading
			if (flat.node.isParent === true && !flat.node.children?.length) {
				return state
			}

			const nextExpanded = new Set(state.expandedIds)
			nextExpanded.add(state.focusedId)

			return {
				...state,
				...reflattenAndViewport(state, nextExpanded, state.focusedId),
			}
		}

		case 'collapse': {
			if (state.focusedId === undefined) return state

			// Already expanded -- collapse it
			if (state.expandedIds.has(state.focusedId)) {
				const nextExpanded = new Set(state.expandedIds)
				nextExpanded.delete(state.focusedId)

				return {
					...state,
					...reflattenAndViewport(state, nextExpanded, state.focusedId),
				}
			}

			// Already collapsed -- move focus to parent
			const parentId = findParentId(state.flatNodes, state.focusedId)
			if (parentId === undefined) return state

			const parentIndex = getFocusedIndex(state.flatNodes, parentId)
			const viewport = computeViewport(
				state.flatNodes.length,
				Math.max(0, parentIndex),
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedId: parentId, viewport }
		}

		case 'toggle-expand': {
			if (state.focusedId === undefined) return state

			if (state.expandedIds.has(state.focusedId)) {
				return treeViewReducer(state, { type: 'collapse' })
			}

			return treeViewReducer(state, { type: 'expand' })
		}

		case 'expand-all': {
			const allIds = collectAllParentIds(state.data)

			return {
				...state,
				...reflattenAndViewport(state, allIds, state.focusedId),
			}
		}

		case 'collapse-all': {
			const emptySet: ReadonlySet<string> = new Set()

			return {
				...state,
				...reflattenAndViewport(state, emptySet, state.focusedId),
			}
		}

		case 'select': {
			if (state.focusedId === undefined) return state

			switch (state.selectionMode) {
				case 'none': {
					return treeViewReducer(state, { type: 'toggle-expand' })
				}

				case 'single': {
					return {
						...state,
						selectedIds: new Set([state.focusedId]),
					}
				}

				case 'multiple': {
					const nextSelected = new Set(state.selectedIds)
					if (nextSelected.has(state.focusedId)) {
						nextSelected.delete(state.focusedId)
					} else {
						nextSelected.add(state.focusedId)
					}

					return { ...state, selectedIds: nextSelected }
				}

				default:
					return state
			}
		}

		case 'focus-parent': {
			if (state.focusedId === undefined) return state

			const parentId = findParentId(state.flatNodes, state.focusedId)
			if (parentId === undefined) return state

			const parentIndex = getFocusedIndex(state.flatNodes, parentId)
			const viewport = computeViewport(
				state.flatNodes.length,
				Math.max(0, parentIndex),
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedId: parentId, viewport }
		}

		case 'focus-first-child': {
			if (state.focusedId === undefined) return state

			const childId = findFirstChildId(
				state.flatNodes,
				state.focusedId,
				state.expandedIds
			)
			if (childId === undefined) return state

			const childIndex = getFocusedIndex(state.flatNodes, childId)
			const viewport = computeViewport(
				state.flatNodes.length,
				Math.max(0, childIndex),
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedId: childId, viewport }
		}

		case 'set-loading': {
			const nextLoading = new Set(state.loadingIds)
			if (action.isLoading) {
				nextLoading.add(action.nodeId)
			} else {
				nextLoading.delete(action.nodeId)
			}

			return { ...state, loadingIds: nextLoading }
		}

		case 'set-children': {
			const nextData = setChildrenInTree(
				state.data,
				action.nodeId,
				action.children
			)

			const nextState = { ...state, data: nextData }

			return {
				...nextState,
				...reflattenAndViewport(nextState, state.expandedIds, state.focusedId),
			}
		}

		case 'expand-node': {
			if (state.expandedIds.has(action.nodeId)) return state

			const expandIdx = state.flatNodes.findIndex(
				(n) => n.node.id === action.nodeId
			)
			if (expandIdx < 0) return state

			const expandFlat = state.flatNodes[expandIdx]
			if (!expandFlat) return state
			if (!expandFlat.hasChildren) return state

			// isParent with no children loaded yet -- adapter handles async loading
			if (
				expandFlat.node.isParent === true &&
				!expandFlat.node.children?.length
			) {
				return state
			}

			const nextExpanded = new Set(state.expandedIds)
			nextExpanded.add(action.nodeId)

			return {
				...state,
				...reflattenAndViewport(state, nextExpanded, state.focusedId),
			}
		}

		case 'collapse-node': {
			if (!state.expandedIds.has(action.nodeId)) return state

			const nextExpanded = new Set(state.expandedIds)
			nextExpanded.delete(action.nodeId)

			// If focused node is a descendant of the collapsing node, move focus
			const nextFocusedId =
				state.focusedId !== undefined &&
				isDescendantOf(state.flatNodes, state.focusedId, action.nodeId)
					? action.nodeId
					: state.focusedId

			return {
				...state,
				...reflattenAndViewport(state, nextExpanded, nextFocusedId),
			}
		}

		case 'reset': {
			return action.state
		}

		default:
			return state
	}
}
//#endregion Reducer

//#region Factory
export function createDefaultTreeViewState<T>(options: {
	data: ITreeNode<T>[]
	selectionMode?: TreeViewSelectionMode
	defaultExpanded?: ReadonlySet<string> | 'all'
	defaultSelected?: ReadonlySet<string>
	visibleNodeCount?: number
}): TreeViewState<T> {
	// Detect duplicate IDs upfront — duplicates cause silent state corruption
	const seenIds = new Set<string>()
	const checkDuplicates = (nodes: ITreeNode<T>[]): void => {
		for (const node of nodes) {
			if (seenIds.has(node.id)) {
				throw new Error(`TreeView: duplicate node id "${node.id}"`)
			}
			seenIds.add(node.id)
			if (node.children) {
				checkDuplicates(node.children)
			}
		}
	}
	checkDuplicates(options.data)

	const selectionMode = options.selectionMode ?? 'none'
	const visibleNodeCount = options.visibleNodeCount ?? Infinity

	const expandedIds: ReadonlySet<string> =
		options.defaultExpanded === 'all'
			? collectAllParentIds(options.data)
			: (options.defaultExpanded ?? new Set())

	const selectedIds: ReadonlySet<string> = options.defaultSelected ?? new Set()

	const flatNodes = flattenTree(options.data, expandedIds)
	const focusedId = flatNodes.length > 0 ? flatNodes[0]!.node.id : undefined

	const viewport = computeViewport(flatNodes.length, 0, visibleNodeCount, {
		fromIndex: 0,
		toIndex: Math.min(visibleNodeCount, flatNodes.length),
	})

	return {
		data: options.data,
		selectionMode,
		flatNodes,
		focusedId,
		expandedIds,
		selectedIds,
		loadingIds: new Set(),
		visibleNodeCount,
		viewport,
	}
}
//#endregion Factory
