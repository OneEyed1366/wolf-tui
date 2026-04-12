<!-- #region Script -->
<script lang="ts">
	import { Box, Text, useInput, Combobox } from '@wolf-tui/svelte'

	let { onBack }: { onBack: () => void } = $props()

	let selected = $state<string | undefined>(undefined)

	useInput((_input, key) => {
		if (key.escape && !selected) onBack()
	})

	//#region Data
	const languages = [
		{ label: 'TypeScript', value: 'ts' },
		{ label: 'JavaScript', value: 'js' },
		{ label: 'Python', value: 'py' },
		{ label: 'Rust', value: 'rs' },
		{ label: 'Go', value: 'go' },
		{ label: 'Ruby', value: 'rb' },
		{ label: 'Java', value: 'java' },
		{ label: 'C++', value: 'cpp' },
		{ label: 'C#', value: 'cs' },
		{ label: 'Kotlin', value: 'kt' },
		{ label: 'Swift', value: 'swift' },
		{ label: 'PHP', value: 'php' },
		{ label: 'Elixir', value: 'ex' },
		{ label: 'Haskell', value: 'hs' },
		{ label: 'Scala', value: 'scala' },
	]
	//#endregion Data
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<Box style={{ flexDirection: 'column', padding: 1 }}>
	<Text style={{ fontWeight: 'bold', color: 'cyan' }}>Combobox Demo</Text>
	<Text style={{ dimColor: true }}>
		Type to filter, ↑↓=navigate, Enter=select, Tab=autofill, Esc=close/back
	</Text>
	<Box style={{ marginTop: 1 }}>
		<Combobox
			options={languages}
			placeholder="Search languages..."
			visibleOptionCount={8}
			onSelect={(value) => { selected = value }}
		/>
	</Box>
	{#if selected}
		<Text style={{ color: 'green', marginTop: 1 }}>
			Selected: {selected}
		</Text>
	{/if}
</Box>
<!-- #endregion Template -->
