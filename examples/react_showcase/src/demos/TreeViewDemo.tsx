import { Box, Text, useInput } from '@wolf-tui/react'
import { TreeView } from '@wolf-tui/react'
import type { ITreeNode } from '@wolf-tui/shared'

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

//#region Component
export function TreeViewDemo({ onBack }: { onBack: () => void }) {
	useInput((_input, key) => {
		if (key.escape) onBack()
	})

	return (
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
					onSelectChange={(_ids) => {
						// visible in WOLFIE_LOG
					}}
				/>
			</Box>
		</Box>
	)
}
//#endregion Component
