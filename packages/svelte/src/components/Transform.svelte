<script lang="ts">
	import { getContext, type Snippet } from 'svelte'
	import { wolfieProps } from '../renderer/wolfie-action.js'
	import { ACCESSIBILITY_CTX } from '../context/symbols.js'
	import type { AccessibilityContextValue } from '../context/types.js'

	let { transform, accessibilityLabel, children }: {
		transform: (children: string, index: number) => string
		accessibilityLabel?: string
		children?: Snippet
	} = $props()

	const accessibility = getContext<AccessibilityContextValue | undefined>(ACCESSIBILITY_CTX)

	let showAriaLabel = $derived(accessibility?.isScreenReaderEnabled && accessibilityLabel)
</script>

{#if children || showAriaLabel}
	<wolfie-text use:wolfieProps={{ internal_transform: transform }}>
		{#if showAriaLabel}
			{accessibilityLabel}
		{:else if children}
			{@render children()}
		{/if}
	</wolfie-text>
{/if}
