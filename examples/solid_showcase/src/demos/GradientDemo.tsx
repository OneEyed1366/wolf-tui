import { createSignal, createMemo, For } from 'solid-js'
import { Box, Text, Gradient, useInput } from '@wolf-tui/solid'

//#region Constants
type GradientPreset =
	| 'rainbow'
	| 'atlas'
	| 'cristal'
	| 'teen'
	| 'mind'
	| 'morning'
	| 'vice'
	| 'passion'
	| 'fruit'
	| 'instagram'
	| 'retro'
	| 'summer'
	| 'pastel'

const PRESETS: GradientPreset[] = [
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
//#endregion Constants

//#region Component
export function GradientDemo(props: { onBack: () => void }) {
	const [presetIndex, setPresetIndex] = createSignal(0)

	useInput((_input, key) => {
		if (key.escape) props.onBack()
		if (key.rightArrow) setPresetIndex((i) => (i + 1) % PRESETS.length)
		if (key.leftArrow)
			setPresetIndex((i) => (i - 1 + PRESETS.length) % PRESETS.length)
	})

	const current = createMemo(() => PRESETS[presetIndex()]!)

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>Gradient Demo</Text>
			<Text style={{ dimColor: true }}>← → = cycle presets | Esc = back</Text>

			<Box style={{ flexDirection: 'column', marginTop: 1 }}>
				<Text style={{ dimColor: true }}>Preset: {current()}</Text>
				<Gradient name={current()}>{SAMPLE_TEXT}</Gradient>
			</Box>

			<Box style={{ flexDirection: 'column', marginTop: 1 }}>
				<Text style={{ dimColor: true }}>Custom colors (red → gold):</Text>
				<Gradient colors={['#ff3366', '#ffd700']}>Hand-picked stops</Gradient>
			</Box>

			<Box style={{ flexDirection: 'column', marginTop: 1 }}>
				<Text style={{ dimColor: true }}>All presets at a glance:</Text>
				<For each={PRESETS}>
					{(name) => (
						<Gradient name={name}>
							{name.padEnd(10, ' ') + '  ' + SAMPLE_TEXT}
						</Gradient>
					)}
				</For>
			</Box>
		</Box>
	)
}
//#endregion Component
