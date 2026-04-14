import { useState } from 'react'
import { Box, Text, useInput } from '@wolf-tui/react'
import { FilePicker } from '@wolf-tui/react'

//#region Component
export function FilePickerDemo({ onBack }: { onBack: () => void }) {
	const [selectedPaths, setSelectedPaths] = useState<string[]>([])
	const [confirmedPaths, setConfirmedPaths] = useState<string[]>([])

	useInput((_input, key) => {
		if (key.escape && confirmedPaths.length === 0) onBack()
	})

	return (
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
					onSelectionChange={(paths) => setSelectedPaths(paths)}
					onSelect={(paths) => setConfirmedPaths(paths)}
					onDirectoryChange={(_path) => {
						// visible in WOLFIE_LOG
					}}
				/>
			</Box>
			{selectedPaths.length > 0 && (
				<Box style={{ flexDirection: 'column', marginTop: 1 }}>
					<Text style={{ color: 'yellow' }}>
						Toggled ({selectedPaths.length}):
					</Text>
					{selectedPaths.map((p) => (
						<Text key={p} style={{ dimColor: true }}>
							{' '}
							{p}
						</Text>
					))}
				</Box>
			)}
			{confirmedPaths.length > 0 && (
				<Box style={{ flexDirection: 'column', marginTop: 1 }}>
					<Text style={{ color: 'green' }}>
						Confirmed ({confirmedPaths.length}):
					</Text>
					{confirmedPaths.map((p) => (
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
