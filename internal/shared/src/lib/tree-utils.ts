//#region Types
export type ITreeNode<T = Record<string, unknown>> = {
	id: string
	label: string
	data?: T
	children?: ITreeNode<T>[]
	isParent?: boolean
}

export type IFlatTreeNode<T = Record<string, unknown>> = {
	node: ITreeNode<T>
	depth: number
	hasChildren: boolean
	parentId: string | undefined
}

export type ITreeNodeState = {
	isFocused: boolean
	isExpanded: boolean
	isSelected: boolean
	isLoading: boolean
	depth: number
	hasChildren: boolean
}
//#endregion Types

//#region Flatten
/**
 * Flattens a tree into a visible list based on expansion state.
 * Only expanded nodes' children are included.
 *
 * Analogy (Naruto): unrolling a scroll — collapsed sections stay sealed,
 * expanded sections reveal their contents.
 */
export function flattenTree<T>(
	nodes: ITreeNode<T>[],
	expandedIds: ReadonlySet<string>,
	depth = 0,
	parentId: string | undefined = undefined
): IFlatTreeNode<T>[] {
	const result: IFlatTreeNode<T>[] = []

	for (const node of nodes) {
		const hasChildren =
			(node.children !== undefined && node.children.length > 0) ||
			node.isParent === true

		result.push({ node, depth, hasChildren, parentId })

		if (hasChildren && expandedIds.has(node.id) && node.children) {
			const childNodes = flattenTree(
				node.children,
				expandedIds,
				depth + 1,
				node.id
			)
			for (const child of childNodes) {
				result.push(child)
			}
		}
	}

	return result
}
//#endregion Flatten

//#region Navigation
export function findParentId<T>(
	flatNodes: IFlatTreeNode<T>[],
	nodeId: string
): string | undefined {
	const node = flatNodes.find((n) => n.node.id === nodeId)
	return node?.parentId
}

export function findFirstChildId<T>(
	flatNodes: IFlatTreeNode<T>[],
	nodeId: string,
	expandedIds: ReadonlySet<string>
): string | undefined {
	if (!expandedIds.has(nodeId)) return undefined

	const idx = flatNodes.findIndex((n) => n.node.id === nodeId)
	if (idx < 0 || idx + 1 >= flatNodes.length) return undefined

	const candidate = flatNodes[idx + 1]!
	return candidate.parentId === nodeId ? candidate.node.id : undefined
}
//#endregion Navigation

//#region Viewport
export type IViewport = {
	fromIndex: number
	toIndex: number
}

export function computeViewport(
	totalCount: number,
	focusedIndex: number,
	visibleCount: number,
	current: IViewport
): IViewport {
	if (visibleCount >= totalCount) {
		return { fromIndex: 0, toIndex: totalCount }
	}

	let { fromIndex, toIndex } = current

	// Scroll down if focused is below viewport
	if (focusedIndex >= toIndex) {
		toIndex = focusedIndex + 1
		fromIndex = toIndex - visibleCount
	}

	// Scroll up if focused is above viewport
	if (focusedIndex < fromIndex) {
		fromIndex = focusedIndex
		toIndex = fromIndex + visibleCount
	}

	// Clamp
	fromIndex = Math.max(0, fromIndex)
	toIndex = Math.min(totalCount, toIndex)

	return { fromIndex, toIndex }
}
//#endregion Viewport
