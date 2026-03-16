<script lang="ts">
	import { renderNewline } from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'

	let { count = 1 }: {
		count?: number
	} = $props()

	let wnode = $derived(renderNewline({ count }))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
