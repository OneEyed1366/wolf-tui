import { Box, Text, useInput } from '@wolf-tui/react'
import { JsonViewer } from '@wolf-tui/react'

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

//#region Component
export function JsonViewerDemo({ onBack }: { onBack: () => void }) {
	useInput((_input, key) => {
		if (key.escape) onBack()
	})

	return (
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
					onSelect={(_path, _value) => {
						// visible in WOLFIE_LOG
					}}
				/>
			</Box>
		</Box>
	)
}
//#endregion Component
