<script setup lang="ts">
import { Box, Text, useInput, JsonViewer } from '@wolf-tui/vue'

const props = defineProps<{ onBack: () => void }>()

useInput((_input, key) => {
	if (key.escape) props.onBack()
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

<script lang="ts">
export default { name: 'JsonViewerDemo' }
</script>

<template>
	<Box :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ fontWeight: 'bold', color: 'cyan' }">JsonViewer Demo</Text>
		<Text :style="{ dimColor: true }">
			arrow-keys=navigate, right/left=expand/collapse, e=expand-all,
			E=collapse-all, g/G=first/last, Esc=back
		</Text>
		<Box :style="{ marginTop: 1 }">
			<JsonViewer
				:data="sampleData"
				:default-expand-depth="2"
				:visible-node-count="16"
				:on-select="(_path: string[], _value: unknown) => {}"
			/>
		</Box>
	</Box>
</template>
