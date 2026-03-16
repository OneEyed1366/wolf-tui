<script lang="ts">
	import { renderSpacer } from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'

	const wnode = renderSpacer()
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
