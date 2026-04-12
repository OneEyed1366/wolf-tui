<!-- #region Script -->
<script lang="ts">
	import { Box, Text, useInput, FilePicker } from '@wolf-tui/svelte'

	let { onBack }: { onBack: () => void } = $props()

	let selectedPaths: string[] = $state.raw([])
	let confirmedPaths: string[] = $state.raw([])

	useInput((_input, key) => {
		if (key.escape && confirmedPaths.length === 0) onBack()
	})

	function handleSelectionChange(paths: string[]) {
		selectedPaths = paths
	}

	function handleSelect(paths: string[]) {
		confirmedPaths = paths
	}
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<Box style={{ flexDirection: 'column', padding: 1 }}>
	<Text style={{ fontWeight: 'bold', color: 'cyan' }}>FilePicker Demo</Text>
	<Text style={{ dimColor: true }}>
		↑↓=navigate Space=toggle(☑) Enter=confirm ←=parent →=enter dir /=filter
		Esc=back
	</Text>
	<Box style={{ marginTop: 1 }}>
		<FilePicker
			initialPath={process.cwd()}
			showDetails
			multiSelect
			maxHeight={12}
			onSelectionChange={handleSelectionChange}
			onSelect={handleSelect}
			onDirectoryChange={(_path) => {
				// visible in WOLFIE_LOG
			}}
		/>
	</Box>
	{#if selectedPaths.length > 0}
		<Box style={{ flexDirection: 'column', marginTop: 1 }}>
			<Text style={{ color: 'yellow' }}>
				Toggled ({selectedPaths.length}):
			</Text>
			{#each selectedPaths as p}
				<Text style={{ dimColor: true }}> {p}</Text>
			{/each}
		</Box>
	{/if}
	{#if confirmedPaths.length > 0}
		<Box style={{ flexDirection: 'column', marginTop: 1 }}>
			<Text style={{ color: 'green' }}>
				Confirmed ({confirmedPaths.length}):
			</Text>
			{#each confirmedPaths as p}
				<Text style={{ dimColor: true }}> {p}</Text>
			{/each}
		</Box>
	{/if}
</Box>
<!-- #endregion Template -->
