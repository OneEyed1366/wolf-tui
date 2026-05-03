<!-- #region Script -->
<script lang="ts">
	import { Box, Text, useInput, Table } from '@wolf-tui/svelte'

	let { onBack }: { onBack: () => void } = $props()

	useInput((_input, key) => {
		if (key.escape) onBack()
	})

	//#region Data
	const data = [
		{ id: 1, name: 'Naruto', role: 'Hokage', level: 100 },
		{ id: 2, name: 'Sasuke', role: 'Jonin', level: 95 },
		{ id: 3, name: 'Sakura', role: 'Medic', level: 88 },
		{ id: 4, name: 'Kakashi', role: 'Jonin', level: 99 },
	]
	//#endregion Data
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<Box style={{ flexDirection: 'column', padding: 1 }}>
	<Text style={{ fontWeight: 'bold', color: 'cyan' }}>Table Demo</Text>
	<Text style={{ dimColor: true }}>Esc=back</Text>
	<Box style={{ marginTop: 1 }}>
		<Table {data} />
	</Box>
</Box>
<!-- #endregion Template -->
