<script lang="ts" generics="T">
	import type { Styles } from '@wolfie/core'
	import type { Snippet } from 'svelte'
	import { wolfieProps } from '../renderer/wolfie-action.js'

	//#region Default Styles
	const staticStyles: Partial<Styles> = {
		position: 'absolute',
		flexDirection: 'column',
	}
	//#endregion Default Styles

	let { items, style, children }: {
		items: T[]
		style?: Styles
		children: Snippet<[T, number]>
	} = $props()

	// Track the index offset — only render newly-added items
	let renderedCount = $state(0)

	$effect(() => {
		// Update rendered count when items length changes
		renderedCount = items.length
	})

	let itemsToRender = $derived(items.slice(renderedCount))
	let fullStyle = $derived({ ...staticStyles, ...style })
</script>

<wolfie-box use:wolfieProps={{ style: fullStyle, internal_static: true }}>
	{#each itemsToRender as item, i}
		{@render children(item, renderedCount + i)}
	{/each}
</wolfie-box>
