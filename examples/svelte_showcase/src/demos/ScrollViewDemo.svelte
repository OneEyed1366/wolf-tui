<!-- #region Script -->
<script lang="ts">
	import { Box, Text, ScrollView, useInput } from '@wolf-tui/svelte'

	let { onBack }: { onBack: () => void } = $props()

	//#region State
	let offset = $state(0)
	let contentHeight = $state(0)
	const viewportHeight = 8
	const items = Array.from(
		{ length: 30 },
		(_, i) => `Item ${String(i + 1).padStart(2, '0')}`
	)
	//#endregion State

	useInput((_input, key) => {
		if (key.escape) onBack()
	})
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<Box style={{ flexDirection: 'column', padding: 1 }}>
	<Text style={{ fontWeight: 'bold', color: 'cyan' }}>ScrollView Demo</Text>
	<Text style={{ dimColor: true }}>
		↑↓=scroll PgUp/PgDn=page Home/End=edges Esc=back
	</Text>

	<Box
		style={{
			flexDirection: 'column',
			marginTop: 1,
			borderStyle: 'round',
			borderColor: 'gray',
		}}
	>
		<ScrollView
			height={viewportHeight}
			onScroll={(o) => {
				offset = o
			}}
			onContentHeightChange={(h) => {
				contentHeight = h
			}}
		>
			<Box style={{ flexDirection: 'column' }}>
				{#each items as item (item)}
					<Text>{item}</Text>
				{/each}
			</Box>
		</ScrollView>
	</Box>

	<Text style={{ dimColor: true, marginTop: 1 }}>
		offset={offset} contentHeight={contentHeight} viewport={viewportHeight}
	</Text>
</Box>
<!-- #endregion Template -->
