<!-- #region Script -->
<script lang="ts">
	import { Box, Text, useInput, TreeView } from '@wolf-tui/svelte'
	import type { ITreeNode } from '@wolf-tui/shared'

	let { onBack }: { onBack: () => void } = $props()

	useInput((_input, key) => {
		if (key.escape) onBack()
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
	//#endregion Data
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<Box style={{ flexDirection: 'column', padding: 1 }}>
	<Text style={{ fontWeight: 'bold', color: 'cyan' }}>TreeView Demo</Text>
	<Text style={{ dimColor: true }}>
		↑↓=navigate →=expand ←=collapse Space=toggle Enter=select Esc=back
	</Text>
	<Box style={{ marginTop: 1 }}>
		<TreeView
			data={treeData}
			selectionMode="multiple"
			defaultExpanded={new Set(['src'])}
			onSelect={(_ids) => {
				// visible in WOLFIE_LOG
			}}
		/>
	</Box>
</Box>
<!-- #endregion Template -->
