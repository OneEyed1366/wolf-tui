<script lang="ts">
	import {
		renderSpinner,
		defaultSpinnerTheme,
		type SpinnerRenderTheme,
	} from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useSpinner } from '../composables/use-spinner.js'

	let { label }: {
		label?: string
	} = $props()

	const { frame } = useSpinner()

	const theme = useComponentTheme<SpinnerRenderTheme>('Spinner')
	const { styles } = theme ?? defaultSpinnerTheme

	let wnode = $derived(renderSpinner(
		{ frame: frame(), label },
		{ styles }
	))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
