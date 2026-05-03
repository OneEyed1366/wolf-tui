import { useState } from 'react'
import { Box, Text, useInput, ScrollView } from '@wolf-tui/react'

//#region Data
const ITEMS = Array.from({ length: 30 }, (_, i) => ({
	id: `item-${i}`,
	label: `Item ${String(i + 1).padStart(2, '0')}`,
}))
//#endregion Data

//#region Component
export function ScrollViewDemo({ onBack }: { onBack: () => void }) {
	const [offset, setOffset] = useState(0)
	const [contentHeight, setContentHeight] = useState(0)
	const viewportHeight = 8

	useInput((_input, key) => {
		if (key.escape) onBack()
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
					borderStyle: 'round',
					borderColor: 'gray',
					flexDirection: 'column',
				}}
			>
				<ScrollView
					height={viewportHeight}
					offset={offset}
					onScroll={setOffset}
					onContentHeightChange={setContentHeight}
				>
					{ITEMS.map((item) => (
						<Text key={item.id}>{item.label}</Text>
					))}
				</ScrollView>
			</Box>
			<Text style={{ dimColor: true, marginTop: 1 }}>
				offset={offset} contentHeight={contentHeight} viewport={viewportHeight}
			</Text>
		</Box>
	)
}
//#endregion Component
