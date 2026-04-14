<!-- #region Script -->
<script lang="ts">
	import { Box, Text, useInput, JsonViewer } from '@wolf-tui/svelte'

	let { onBack }: { onBack: () => void } = $props()

	useInput((_input, key) => {
		if (key.escape) onBack()
	})

	//#region Data
	const sampleData = {
		name: 'wolf-tui',
		version: '1.4.0',
		frameworks: ['react', 'vue', 'angular', 'solid', 'svelte'],
		community: {
			timer: { variants: ['timer', 'countdown', 'stopwatch'] },
			treeView: { selectionModes: ['none', 'single', 'multiple'] },
			combobox: { fuzzyMatch: true, async: false },
			jsonViewer: { types: 16, virtualScroll: true },
			filePicker: { multiSelect: true, symlinks: true },
		},
		stats: {
			components: 25,
			adapters: 5,
			tests: 1113,
			nullExample: null,
			boolExample: true,
			nested: {
				deep: {
					value: 42,
					array: [1, 2, 3],
				},
			},
		},
	}
	//#endregion Data
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<Box style={{ flexDirection: 'column', padding: 1 }}>
	<Text style={{ fontWeight: 'bold', color: 'cyan' }}>JsonViewer Demo</Text>
	<Text style={{ dimColor: true }}>
		↑↓=navigate →/←=expand/collapse e=expand-all E=collapse-all
		g/G=first/last Esc=back
	</Text>
	<Box style={{ marginTop: 1 }}>
		<JsonViewer
			data={sampleData}
			defaultExpandDepth={2}
			visibleNodeCount={16}
		/>
	</Box>
</Box>
<!-- #endregion Template -->
