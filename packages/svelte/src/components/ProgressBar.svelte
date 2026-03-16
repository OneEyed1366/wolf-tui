<script lang="ts">
	import {
		renderProgressBar,
		defaultProgressBarTheme,
		type ProgressBarRenderTheme,
	} from '@wolfie/shared'
	import { measureElement } from '@wolfie/core'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { WolfieElement } from '../renderer/wolfie-element.js'

	let { value = 0 }: {
		value: number
	} = $props()

	let width = $state(0)

	const theme = useComponentTheme<ProgressBarRenderTheme>('ProgressBar')
	const resolvedTheme = theme ?? defaultProgressBarTheme

	let wnode = $derived(renderProgressBar(
		{ value, width },
		resolvedTheme
	))

	// Svelte action to measure the container element after mount
	function measureContainer(node: WolfieElement) {
		if (node?.domElement) {
			const dims = measureElement(node.domElement)
			width = dims.width
		}

		return {
			update() {
				if (node?.domElement) {
					const dims = measureElement(node.domElement)
					width = dims.width
				}
			},
			destroy() {},
		}
	}
</script>

<wolfie-box use:measureContainer use:mountWNode={wnode}></wolfie-box>
