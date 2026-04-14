<!-- #region Script -->
<script lang="ts">
	import {
		renderJsonViewer,
		defaultJsonViewerTheme,
		type JsonViewerRenderTheme,
	} from '@wolf-tui/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useJsonViewerState } from '../composables/use-json-viewer-state.svelte.js'
	import { useJsonViewer } from '../composables/use-json-viewer.js'

	let {
		data,
		defaultExpandDepth = 1,
		visibleNodeCount = 20,
		maxStringLength = 120,
		sortKeys = false,
		maxDepth = 100,
		isDisabled = false,
	}: {
		data: unknown
		defaultExpandDepth?: number
		visibleNodeCount?: number
		maxStringLength?: number
		sortKeys?: boolean
		maxDepth?: number
		isDisabled?: boolean
	} = $props()

	const state = useJsonViewerState({
		data: () => data,
		defaultExpandDepth,
		visibleNodeCount,
		maxStringLength,
		sortKeys,
		maxDepth,
	})

	useJsonViewer({ isDisabled: () => isDisabled, state })

	const theme = useComponentTheme<JsonViewerRenderTheme>('JsonViewer')
	const { styles, config } = theme ?? defaultJsonViewerTheme

	let wnode = $derived(renderJsonViewer(
		{
			visibleNodes: state.visibleNodes(),
			hasScrollUp: state.hasScrollUp(),
			hasScrollDown: state.hasScrollDown(),
			indentWidth: state.indentWidth(),
		},
		{ styles, config }
	))
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<wolfie-box use:mountWNode={wnode}></wolfie-box>
<!-- #endregion Template -->
