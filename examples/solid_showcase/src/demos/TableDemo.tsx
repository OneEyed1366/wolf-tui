import { Box, Text, useInput, Table } from '@wolf-tui/solid'

//#region Data
const data = [
	{ id: 1, name: 'Naruto', role: 'Hokage', level: 100 },
	{ id: 2, name: 'Sasuke', role: 'Jonin', level: 95 },
	{ id: 3, name: 'Sakura', role: 'Medic', level: 88 },
	{ id: 4, name: 'Kakashi', role: 'Jonin', level: 99 },
]
//#endregion Data

//#region Component
export function TableDemo(props: { onBack: () => void }) {
	useInput((_input, key) => {
		if (key.escape) props.onBack()
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>Table Demo</Text>
			<Text style={{ dimColor: true }}>Esc=back</Text>
			<Box style={{ marginTop: 1 }}>
				<Table data={data} />
			</Box>
		</Box>
	)
}
//#endregion Component
