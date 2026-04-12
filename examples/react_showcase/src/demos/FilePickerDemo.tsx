import { useState } from 'react'
import { Box, Text, useInput } from '@wolf-tui/react'
import { FilePicker } from '@wolf-tui/react'

//#region Component
export function FilePickerDemo({ onBack }: { onBack: () => void }) {
	const [selectedPaths, setSelectedPaths] = useState<string[]>([])

	useInput((_input, key) => {
		if (key.escape && selectedPaths.length === 0) onBack()
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>FilePicker Demo</Text>
			<Text style={{ dimColor: true }}>
				↑↓=navigate Enter=open/select ←=parent →=enter dir Space=toggle /=filter
				Esc=back
			</Text>
			<Box style={{ marginTop: 1 }}>
				<FilePicker
					initialPath={process.cwd()}
					showDetails
					multiSelect
					maxHeight={12}
					onSelect={(paths) => setSelectedPaths(paths)}
					onDirectoryChange={(_path) => {
						// visible in WOLFIE_LOG
					}}
				/>
			</Box>
			{selectedPaths.length > 0 && (
				<Box style={{ flexDirection: 'column', marginTop: 1 }}>
					<Text style={{ color: 'green' }}>Selected:</Text>
					{selectedPaths.map((p) => (
						<Text key={p} style={{ dimColor: true }}>
							{' '}
							{p}
						</Text>
					))}
				</Box>
			)}
		</Box>
	)
}
//#endregion Component
