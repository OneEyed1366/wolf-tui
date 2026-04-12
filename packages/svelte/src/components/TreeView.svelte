<!-- #region Script -->
<script lang="ts">
	import {
		renderTreeView,
		defaultTreeViewTheme,
		type TreeViewRenderTheme,
		type TreeViewSelectionMode,
		type ITreeNode,
	} from '@wolf-tui/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useTreeViewState } from '../composables/use-tree-view-state.svelte.js'
	import { useTreeView } from '../composables/use-tree-view.js'

	let {
		data,
		selectionMode = 'none',
		defaultExpanded,
		defaultSelected,
		visibleNodeCount = 10,
		isDisabled = false,
		onSelect,
		onExpand,
		onCollapse,
		onLoadChildren,
	}: {
		data: ITreeNode[]
		selectionMode?: TreeViewSelectionMode
		defaultExpanded?: ReadonlySet<string> | 'all'
		defaultSelected?: ReadonlySet<string>
		visibleNodeCount?: number
		isDisabled?: boolean
		onSelect?: (selectedIds: ReadonlySet<string>) => void
		onExpand?: (nodeId: string) => void
		onCollapse?: (nodeId: string) => void
		onLoadChildren?: (nodeId: string) => void
	} = $props()

	const state = useTreeViewState({
		data: () => data,
		selectionMode,
		defaultExpanded,
		defaultSelected,
		visibleNodeCount,
		onSelect,
		onExpand,
		onCollapse,
		onLoadChildren,
	})

	useTreeView({ isDisabled: () => isDisabled, state })

	const theme = useComponentTheme<TreeViewRenderTheme>('TreeView')
	const { styles, config } = theme ?? defaultTreeViewTheme

	let wnode = $derived(renderTreeView(
		{
			visibleNodes: state.visibleNodes(),
			selectionMode: state.selectionMode(),
			hasScrollUp: state.hasScrollUp(),
			hasScrollDown: state.hasScrollDown(),
			scrollUpCount: state.scrollUpCount(),
			scrollDownCount: state.scrollDownCount(),
		},
		{ styles, config }
	))
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<wolfie-box use:mountWNode={wnode}></wolfie-box>
<!-- #endregion Template -->
