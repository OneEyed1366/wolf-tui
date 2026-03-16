<script lang="ts">
	import { setContext, getContext, type Snippet } from 'svelte'
	import figures from 'figures'
	import Box from './Box.svelte'
	import { UL_DEPTH_CTX, UL_MARKER_CTX } from '../context/symbols.js'

	//#region Constants
	const DEFAULT_MARKERS = [figures.bullet, figures.line, figures.pointer]
	//#endregion Constants

	let { children }: {
		children: Snippet
	} = $props()

	const parentDepth = getContext<number | undefined>(UL_DEPTH_CTX) ?? 0
	const marker = DEFAULT_MARKERS[parentDepth % DEFAULT_MARKERS.length] ?? figures.bullet

	setContext(UL_DEPTH_CTX, parentDepth + 1)
	setContext(UL_MARKER_CTX, marker)
</script>

<Box style={{ flexDirection: 'column' }}>
	{@render children()}
</Box>
