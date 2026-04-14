import {
	renderTreeView,
	defaultTreeViewTheme,
	type TreeViewRenderTheme,
	type TreeViewSelectionMode,
	type ITreeNode,
	type TreeViewVisibleNode,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../../theme/theme'
import { useTreeViewState } from './use-tree-view-state'
import { useTreeView } from './use-tree-view'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type ITreeViewProps<T = Record<string, unknown>> = {
	/**
	 * Tree data.
	 */
	data: ITreeNode<T>[]

	/**
	 * Selection mode: 'none', 'single', or 'multiple'.
	 *
	 * @default 'none'
	 */
	selectionMode?: TreeViewSelectionMode

	/**
	 * IDs of nodes expanded by default, or 'all' to expand everything.
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
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Async loader for child nodes (lazy loading).
	 */
	loadChildren?: (node: ITreeNode<T>) => Promise<ITreeNode<T>[]>

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
//#endregion Types

//#region Component
export function TreeView<T = Record<string, unknown>>({
	data,
	selectionMode = 'none',
	defaultExpanded,
	defaultSelected,
	visibleNodeCount,
	isDisabled = false,
	loadChildren,
	onFocusChange,
	onExpandChange,
	onSelectChange,
}: ITreeViewProps<T>) {
	const state = useTreeViewState({
		data,
		selectionMode,
		defaultExpanded,
		defaultSelected,
		visibleNodeCount,
		onFocusChange,
		onExpandChange,
		onSelectChange,
	})

	useTreeView({ isDisabled, loadChildren, state })

	const theme = useComponentTheme<TreeViewRenderTheme>('TreeView')
	const resolvedTheme = theme ?? defaultTreeViewTheme

	const visibleNodes: TreeViewVisibleNode[] = state.visibleNodes.map(
		(flatNode) => ({
			id: flatNode.node.id,
			label: flatNode.node.label,
			state: {
				depth: flatNode.depth,
				isFocused: flatNode.node.id === state.focusedId,
				isExpanded: state.expandedIds.has(flatNode.node.id),
				isSelected: state.selectedIds.has(flatNode.node.id),
				hasChildren: flatNode.hasChildren,
				isLoading: state.loadingIds.has(flatNode.node.id),
			},
		})
	)

	const totalFlat = state.flatNodes.length
	const hasScrollUp = state.viewportFrom > 0
	const hasScrollDown = state.viewportTo < totalFlat

	return wNodeToReact(
		renderTreeView(
			{
				visibleNodes,
				selectionMode,
				hasScrollUp,
				hasScrollDown,
				scrollUpCount: state.viewportFrom,
				scrollDownCount: totalFlat - state.viewportTo,
			},
			resolvedTheme
		)
	)
}
//#endregion Component
