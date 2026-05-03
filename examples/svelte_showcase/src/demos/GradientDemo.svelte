<!-- #region Script -->
<script lang="ts">
	import { Box, Text, useInput, Gradient } from '@wolf-tui/svelte'
	import type { GradientName } from '@wolf-tui/svelte'

	let { onBack }: { onBack: () => void } = $props()

	//#region Data
	const PRESETS: GradientName[] = [
		'rainbow',
		'atlas',
		'cristal',
		'teen',
		'mind',
		'morning',
		'vice',
		'passion',
		'fruit',
		'instagram',
		'retro',
		'summer',
		'pastel',
	]

	const SAMPLE_TEXT = 'wolf-tui gradient demo'
	//#endregion Data

	//#region State
	let index = $state(0)
	let current = $derived(PRESETS[index] ?? 'rainbow')
	//#endregion State

	//#region Input
	useInput((_input, key) => {
		if (key.escape) onBack()
		if (key.rightArrow) index = (index + 1) % PRESETS.length
		if (key.leftArrow) index = (index - 1 + PRESETS.length) % PRESETS.length
	})
	//#endregion Input
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<Box style={{ flexDirection: 'column', padding: 1 }}>
	<Text style={{ fontWeight: 'bold', color: 'cyan' }}>Gradient Demo</Text>
	<Text style={{ dimColor: true }}>
		← → = cycle presets | Esc = back
	</Text>

	<Box style={{ flexDirection: 'column', marginTop: 1 }}>
		<Text style={{ dimColor: true }}>Preset: {current}</Text>
		<Gradient text={SAMPLE_TEXT} name={current} />
	</Box>

	<Box style={{ flexDirection: 'column', marginTop: 1 }}>
		<Text style={{ dimColor: true }}>Custom colors (red → gold):</Text>
		<Gradient text="Hand-picked stops" colors={['#ff3366', '#ffd700']} />
	</Box>

	<Box style={{ flexDirection: 'column', marginTop: 1 }}>
		<Text style={{ dimColor: true }}>All presets at a glance:</Text>
		{#each PRESETS as name (name)}
			<Gradient text={`${name.padEnd(10, ' ')}  ${SAMPLE_TEXT}`} {name} />
		{/each}
	</Box>
</Box>
<!-- #endregion Template -->
