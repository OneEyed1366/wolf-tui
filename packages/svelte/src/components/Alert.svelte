<script lang="ts">
	import {
		renderAlert,
		defaultAlertTheme,
		type AlertRenderTheme,
	} from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'

	//#region Types
	type AlertVariant = 'info' | 'success' | 'error' | 'warning'
	//#endregion Types

	let { variant, title, children }: {
		variant: AlertVariant
		title?: string
		children?: string
	} = $props()

	const theme = useComponentTheme<AlertRenderTheme>('Alert')
	const { styles, config } = theme ?? defaultAlertTheme

	let wnode = $derived(renderAlert(
		{ variant, title, message: String(children ?? '') },
		{ styles, config }
	))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
