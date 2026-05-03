import { createSignal, For } from 'solid-js'
import { Box, Text, ScrollView, useInput } from '@wolf-tui/solid'

//#region Data
const ITEMS = Array.from({ length: 30 }, (_, i) => ({
	id: i,
	label: `Item ${String(i + 1).padStart(2, '0')}`,
}))

const VIEWPORT_HEIGHT = 8
//#endregion Data

//#region Component
export function ScrollViewDemo(props: { onBack: () => void }) {
	const [offset, setOffset] = createSignal(0)
	const [contentHeight, setContentHeight] = createSignal(0)

	useInput((_input, key) => {
		if (key.escape) props.onBack()
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>ScrollView Demo</Text>
			<Text style={{ dimColor: true }}>
				↑↓=scroll PgUp/PgDn=page Home/End=edges Esc=back
			</Text>
			<Box
				style={{
					marginTop: 1,
					flexDirection: 'column',
					borderStyle: 'round',
					borderColor: 'gray',
				}}
			>
				<ScrollView
					height={VIEWPORT_HEIGHT}
					onScroll={setOffset}
					onContentHeightChange={setContentHeight}
				>
					<For each={ITEMS}>{(item) => <Text>{item.label}</Text>}</For>
				</ScrollView>
			</Box>
			<Text style={{ dimColor: true, marginTop: 1 }}>
				offset={offset()} contentHeight={contentHeight()} viewport=
				{VIEWPORT_HEIGHT}
			</Text>
		</Box>
	)
}
//#endregion Component
