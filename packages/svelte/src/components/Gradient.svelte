<script lang="ts">
	import {
		renderGradient,
		defaultGradientTheme,
		type GradientRenderTheme,
		type GradientName,
	} from '@wolf-tui/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'

	let { text = '', name, colors }: {
		text?: string
		name?: GradientName
		colors?: string[]
	} = $props()

	const theme = useComponentTheme<GradientRenderTheme>('Gradient')
	const { styles } = theme ?? defaultGradientTheme

	let wnode = $derived(renderGradient({ text, name, colors }, { styles }))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
