import { useState } from 'react'
import { render, Box, Text, useInput } from '@wolf-tui/react'
import { TimerDemo } from './demos/TimerDemo'
import { TreeViewDemo } from './demos/TreeViewDemo'
import { ComboboxDemo } from './demos/ComboboxDemo'
import { JsonViewerDemo } from './demos/JsonViewerDemo'
import { FilePickerDemo } from './demos/FilePickerDemo'
import { BigTextDemo } from './demos/BigTextDemo'

//#region Menu
type DemoName =
	| 'timer'
	| 'treeview'
	| 'combobox'
	| 'jsonviewer'
	| 'filepicker'
	| 'bigtext'

const DEMOS: Array<{ key: DemoName; label: string }> = [
	{ key: 'timer', label: 'Timer / Countdown / Stopwatch' },
	{ key: 'treeview', label: 'TreeView' },
	{ key: 'combobox', label: 'Combobox (Autocomplete)' },
	{ key: 'jsonviewer', label: 'JsonViewer' },
	{ key: 'filepicker', label: 'FilePicker' },
	{ key: 'bigtext', label: 'BigText (ink-big-text parity)' },
]
//#endregion Menu

//#region App
export function App() {
	const [activeDemo, setActiveDemo] = useState<DemoName | null>(null)

	if (activeDemo === 'timer')
		return <TimerDemo onBack={() => setActiveDemo(null)} />
	if (activeDemo === 'treeview')
		return <TreeViewDemo onBack={() => setActiveDemo(null)} />
	if (activeDemo === 'combobox')
		return <ComboboxDemo onBack={() => setActiveDemo(null)} />
	if (activeDemo === 'jsonviewer')
		return <JsonViewerDemo onBack={() => setActiveDemo(null)} />
	if (activeDemo === 'filepicker')
		return <FilePickerDemo onBack={() => setActiveDemo(null)} />
	if (activeDemo === 'bigtext')
		return <BigTextDemo onBack={() => setActiveDemo(null)} />

	return <Menu onSelect={setActiveDemo} />
}

function Menu({ onSelect }: { onSelect: (demo: DemoName) => void }) {
	const [focused, setFocused] = useState(0)

	useInput((_input, key) => {
		if (key.downArrow) setFocused((f) => Math.min(f + 1, DEMOS.length - 1))
		if (key.upArrow) setFocused((f) => Math.max(f - 1, 0))
		if (key.return) onSelect(DEMOS[focused]!.key)
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>
				wolf-tui Community Components Showcase
			</Text>
			<Text style={{ dimColor: true }}>
				Use ↑↓ to navigate, Enter to select, Ctrl+C to exit
			</Text>
			<Box style={{ flexDirection: 'column', marginTop: 1 }}>
				{DEMOS.map((demo, i) => (
					<Text
						key={demo.key}
						style={{ color: i === focused ? 'blue' : undefined }}
					>
						{i === focused ? '❯ ' : '  '}
						{demo.label}
					</Text>
				))}
			</Box>
		</Box>
	)
}
//#endregion App

//#region Entry
if (typeof process !== 'undefined' && !process.env.WOLFIE_VERIFY) {
	render(<App />)
}
//#endregion Entry
