import { createSignal, Show, For } from 'solid-js'
import { render, Box, Text, useInput } from '@wolf-tui/solid'
import { TimerDemo } from './demos/TimerDemo'
import { TreeViewDemo } from './demos/TreeViewDemo'
import { ComboboxDemo } from './demos/ComboboxDemo'
import { JsonViewerDemo } from './demos/JsonViewerDemo'
import { FilePickerDemo } from './demos/FilePickerDemo'
import { TableDemo } from './demos/TableDemo'
import { ScrollViewDemo } from './demos/ScrollViewDemo'
import { GradientDemo } from './demos/GradientDemo'

//#region Menu
type DemoName =
	| 'timer'
	| 'treeview'
	| 'combobox'
	| 'jsonviewer'
	| 'filepicker'
	| 'table'
	| 'scrollview'
	| 'gradient'

const DEMOS: Array<{ key: DemoName; label: string }> = [
	{ key: 'timer', label: 'Timer / Countdown / Stopwatch' },
	{ key: 'treeview', label: 'TreeView' },
	{ key: 'combobox', label: 'Combobox (Autocomplete)' },
	{ key: 'jsonviewer', label: 'JsonViewer' },
	{ key: 'filepicker', label: 'FilePicker' },
	{ key: 'table', label: 'Table' },
	{ key: 'scrollview', label: 'ScrollView' },
	{ key: 'gradient', label: 'Gradient (ink-gradient port)' },
]
//#endregion Menu

//#region App
export function App() {
	const [activeDemo, setActiveDemo] = createSignal<DemoName | null>(null)
	const goBack = () => setActiveDemo(null)

	return (
		<>
			<Show when={activeDemo() === 'timer'}>
				<TimerDemo onBack={goBack} />
			</Show>
			<Show when={activeDemo() === 'treeview'}>
				<TreeViewDemo onBack={goBack} />
			</Show>
			<Show when={activeDemo() === 'combobox'}>
				<ComboboxDemo onBack={goBack} />
			</Show>
			<Show when={activeDemo() === 'jsonviewer'}>
				<JsonViewerDemo onBack={goBack} />
			</Show>
			<Show when={activeDemo() === 'filepicker'}>
				<FilePickerDemo onBack={goBack} />
			</Show>
			<Show when={activeDemo() === 'table'}>
				<TableDemo onBack={goBack} />
			</Show>
			<Show when={activeDemo() === 'scrollview'}>
				<ScrollViewDemo onBack={goBack} />
			</Show>
			<Show when={activeDemo() === 'gradient'}>
				<GradientDemo onBack={goBack} />
			</Show>
			<Show when={activeDemo() === null}>
				<Menu onSelect={setActiveDemo} />
			</Show>
		</>
	)
}

function Menu(props: { onSelect: (demo: DemoName) => void }) {
	const [focused, setFocused] = createSignal(0)

	useInput((_input, key) => {
		if (key.downArrow) setFocused((f) => Math.min(f + 1, DEMOS.length - 1))
		if (key.upArrow) setFocused((f) => Math.max(f - 1, 0))
		if (key.return) props.onSelect(DEMOS[focused()]!.key)
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>
				wolf-tui Community Components Showcase
			</Text>
			<Text style={{ dimColor: true }}>
				Use arrow-keys to navigate, Enter to select, Ctrl+C to exit
			</Text>
			<Box style={{ flexDirection: 'column', marginTop: 1 }}>
				<For each={DEMOS}>
					{(demo, i) => (
						<Text style={{ color: i() === focused() ? 'blue' : undefined }}>
							{i() === focused() ? '> ' : '  '}
							{demo.label}
						</Text>
					)}
				</For>
			</Box>
		</Box>
	)
}
//#endregion App

//#region Entry
if (typeof process !== 'undefined' && process.env['WOLFIE_VERIFY'] !== '1') {
	render(App, {
		maxFps: 30,
	})
}
//#endregion Entry
