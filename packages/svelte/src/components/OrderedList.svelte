<script lang="ts">
	import { setContext, type Snippet } from 'svelte'
	import Box from './Box.svelte'
	import { OL_COUNTER_CTX } from '../context/symbols.js'

	let { children }: {
		children: Snippet
	} = $props()

	// Mutable counter — resets each mount, increments per OrderedListItem
	let counter = 0
	const getNextIndex = () => ++counter

	setContext(OL_COUNTER_CTX, { getNextIndex })
</script>

<Box style={{ flexDirection: 'column' }}>
	{@render children()}
</Box>
