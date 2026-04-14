<script setup lang="ts">
import { Box, Text, useInput, TreeView } from '@wolf-tui/vue'
import type { ITreeNode } from '@wolf-tui/shared'

const props = defineProps<{ onBack: () => void }>()

useInput((_input, key) => {
	if (key.escape) props.onBack()
})

//#region Data
const treeData: ITreeNode[] = [
	{
		id: 'src',
		label: 'src',
		children: [
			{
				id: 'src/components',
				label: 'components',
				children: [
					{ id: 'src/components/Timer.tsx', label: 'Timer.tsx' },
					{ id: 'src/components/TreeView.tsx', label: 'TreeView.tsx' },
					{ id: 'src/components/Combobox.tsx', label: 'Combobox.tsx' },
				],
			},
			{
				id: 'src/utils',
				label: 'utils',
				children: [
					{ id: 'src/utils/fuzzy-match.ts', label: 'fuzzy-match.ts' },
					{ id: 'src/utils/time-format.ts', label: 'time-format.ts' },
				],
			},
			{ id: 'src/index.ts', label: 'index.ts' },
		],
	},
	{
		id: 'package.json',
		label: 'package.json',
	},
	{
		id: 'tsconfig.json',
		label: 'tsconfig.json',
	},
]

const defaultExpanded = new Set(['src'])
//#endregion Data
</script>

<script lang="ts">
export default { name: 'TreeViewDemo' }
</script>

<template>
	<Box :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ fontWeight: 'bold', color: 'cyan' }">TreeView Demo</Text>
		<Text :style="{ dimColor: true }">
			arrow-keys=navigate, right=expand, left=collapse, Space=toggle,
			Enter=select, Esc=back
		</Text>
		<Box :style="{ marginTop: 1 }">
			<TreeView
				:data="treeData"
				selection-mode="multiple"
				:default-expanded="defaultExpanded"
				:on-select-change="(_ids: string[]) => {}"
			/>
		</Box>
	</Box>
</template>
