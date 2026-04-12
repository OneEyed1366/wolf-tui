import { createSignal, Show, For } from 'solid-js'
import { Box, Text, useInput } from '@wolf-tui/solid'
import { FilePicker } from '@wolf-tui/solid'

//#region Component
export function FilePickerDemo(props: { onBack: () => void }) {
	const [selectedPaths, setSelectedPaths] = createSignal<string[]>([])
	const [confirmedPaths, setConfirmedPaths] = createSignal<string[]>([])

	useInput((_input, key) => {
		if (key.escape && confirmedPaths().length === 0) props.onBack()
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>FilePicker Demo</Text>
			<Text style={{ dimColor: true }}>
				arrow-keys navigate, Space=toggle, Enter=confirm, left=parent,
				right=enter dir, /=filter, Esc=back
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
			<Show when={selectedPaths().length > 0}>
				<Box style={{ flexDirection: 'column', marginTop: 1 }}>
					<Text style={{ color: 'yellow' }}>
						Toggled ({selectedPaths().length}):
					</Text>
					<For each={selectedPaths()}>
						{(p) => <Text style={{ dimColor: true }}> {p}</Text>}
					</For>
				</Box>
			</Show>
			<Show when={confirmedPaths().length > 0}>
				<Box style={{ flexDirection: 'column', marginTop: 1 }}>
					<Text style={{ color: 'green' }}>
						Confirmed ({confirmedPaths().length}):
					</Text>
					<For each={confirmedPaths()}>
						{(p) => <Text style={{ dimColor: true }}> {p}</Text>}
					</For>
				</Box>
			</Show>
		</Box>
	)
}
//#endregion Component
