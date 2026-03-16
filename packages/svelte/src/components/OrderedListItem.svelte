<script lang="ts">
	import { getContext, type Snippet } from 'svelte'
	import Box from './Box.svelte'
	import Text from './Text.svelte'
	import { OL_COUNTER_CTX } from '../context/symbols.js'

	let { children }: {
		children: Snippet
	} = $props()

	const ctx = getContext<{ getNextIndex: () => number } | undefined>(OL_COUNTER_CTX)
	const index = ctx?.getNextIndex() ?? 1
</script>

<Box style={{ flexDirection: 'row' }}>
	<Text style={{ color: 'green' }}>{index}.</Text>
	<Box style={{ flexDirection: 'column', marginLeft: 1 }}>
		{@render children()}
	</Box>
</Box>
