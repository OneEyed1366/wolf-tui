<script lang="ts">
	import { getContext, type Snippet } from 'svelte'
	import figures from 'figures'
	import Box from './Box.svelte'
	import Text from './Text.svelte'
	import { UL_MARKER_CTX } from '../context/symbols.js'

	let { children }: {
		children: Snippet
	} = $props()

	const marker = getContext<string | undefined>(UL_MARKER_CTX) ?? figures.line
</script>

<Box style={{ flexDirection: 'row' }}>
	<Text style={{ color: 'green' }}>{marker}</Text>
	<Box style={{ flexDirection: 'column', marginLeft: 1 }}>
		{@render children()}
	</Box>
</Box>
