<script lang="ts">
	import type { Snippet } from 'svelte'
	import figures from 'figures'
	import Box from './Box.svelte'
	import Text from './Text.svelte'

	let { isFocused, isSelected, children }: {
		isFocused: boolean
		isSelected: boolean
		children?: Snippet
	} = $props()
</script>

<Box style={{ gap: 1, paddingLeft: isFocused ? 0 : 2 }}>
	{#if isFocused}
		<Text style={{ color: 'blue' }}>{figures.pointer}</Text>
	{/if}
	<Text style={{ color: isSelected ? 'green' : isFocused ? 'blue' : undefined }}>
		{#if children}
			{@render children()}
		{/if}
	</Text>
	{#if isSelected}
		<Text style={{ color: 'green' }}>{figures.tick}</Text>
	{/if}
</Box>
