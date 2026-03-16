<script lang="ts">
	import type { Styles } from '@wolfie/core'
	import {
		renderBadge,
		defaultBadgeTheme,
		type BadgeRenderTheme,
	} from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'

	let { color, children }: {
		color?: Styles['color']
		children?: string
	} = $props()

	const theme = useComponentTheme<BadgeRenderTheme>('Badge')
	const { styles } = theme ?? defaultBadgeTheme

	let wnode = $derived(renderBadge(
		{ label: String(children ?? '').toUpperCase(), color },
		{ styles }
	))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
