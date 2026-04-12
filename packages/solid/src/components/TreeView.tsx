import { type JSX, splitProps, createMemo } from 'solid-js'
import {
	renderTreeView,
	defaultTreeViewTheme,
	type TreeViewRenderTheme,
	type TreeViewSelectionMode,
	type ITreeNode,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { useTreeViewState } from '../composables/use-tree-view-state'
import { useTreeView } from '../composables/use-tree-view'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface ITreeViewProps<T = Record<string, unknown>> {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

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
	 */
	visibleNodeCount?: number

	/**
	 * Called when selection changes.
	 */
	onSelect?: (selectedIds: ReadonlySet<string>) => void

	/**
	 * Called when a node is expanded.
	 */
	onExpand?: (nodeId: string) => void

	/**
	 * Called when a node is collapsed.
	 */
	onCollapse?: (nodeId: string) => void
}
//#endregion Types

//#region Component
export function TreeView<T = Record<string, unknown>>(
	props: ITreeViewProps<T>
): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'data',
		'selectionMode',
		'defaultExpanded',
		'defaultSelected',
		'visibleNodeCount',
		'onSelect',
		'onExpand',
		'onCollapse',
	])

	const state = useTreeViewState({
		data: local.data,
		selectionMode: local.selectionMode,
		defaultExpanded: local.defaultExpanded,
		defaultSelected: local.defaultSelected,
		visibleNodeCount: local.visibleNodeCount,
		onSelect: local.onSelect,
		onExpand: local.onExpand,
		onCollapse: local.onCollapse,
	})

	useTreeView({ isDisabled: () => local.isDisabled, state })

	const theme = useComponentTheme<TreeViewRenderTheme>('TreeView')
	const { styles, config } = theme ?? defaultTreeViewTheme

	const wnode = createMemo(() =>
		renderTreeView(
			{
				visibleNodes: state.visibleNodes(),
				selectionMode: state.selectionMode(),
				hasScrollUp: state.hasScrollUp(),
				hasScrollDown: state.hasScrollDown(),
				scrollUpCount: state.scrollUpCount(),
				scrollDownCount: state.scrollDownCount(),
			},
			{ styles, config }
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component

export {
	defaultTreeViewTheme as treeViewTheme,
	type TreeViewRenderTheme as TreeViewTheme,
} from '@wolf-tui/shared'
