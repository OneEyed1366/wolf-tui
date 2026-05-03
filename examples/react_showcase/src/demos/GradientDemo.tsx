import { useState } from 'react'
import { Box, Text, Gradient, useInput } from '@wolf-tui/react'
import type { GradientName } from '@wolf-tui/react'

const PRESETS: GradientName[] = [
	'rainbow',
	'atlas',
	'cristal',
	'teen',
	'mind',
	'morning',
	'vice',
	'passion',
	'fruit',
	'instagram',
	'retro',
	'summer',
	'pastel',
]

const SAMPLE_TEXT = 'wolf-tui gradient demo'

//#region Component
export function GradientDemo({ onBack }: { onBack: () => void }) {
	const [presetIndex, setPresetIndex] = useState(0)

	useInput((_input, key) => {
		if (key.escape) onBack()
		if (key.rightArrow) setPresetIndex((i) => (i + 1) % PRESETS.length)
		if (key.leftArrow)
			setPresetIndex((i) => (i - 1 + PRESETS.length) % PRESETS.length)
	})

	const current = PRESETS[presetIndex]!

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>Gradient Demo</Text>
			<Text style={{ dimColor: true }}>← → = cycle presets | Esc = back</Text>

			<Box style={{ flexDirection: 'column', marginTop: 1 }}>
				<Text style={{ dimColor: true }}>Preset: {current}</Text>
				<Gradient name={current}>{SAMPLE_TEXT}</Gradient>
			</Box>

			<Box style={{ flexDirection: 'column', marginTop: 1 }}>
				<Text style={{ dimColor: true }}>Custom colors (red → gold):</Text>
				<Gradient colors={['#ff3366', '#ffd700']}>Hand-picked stops</Gradient>
			</Box>

			<Box style={{ flexDirection: 'column', marginTop: 1 }}>
				<Text style={{ dimColor: true }}>All presets at a glance:</Text>
				{PRESETS.map((name) => (
					<Gradient key={name} name={name}>
						{name.padEnd(10, ' ')} {SAMPLE_TEXT}
					</Gradient>
				))}
			</Box>
		</Box>
	)
}
//#endregion Component
