<!-- #region Script -->
<script lang="ts">
	import { Box, Text, useInput } from '@wolf-tui/svelte'

	//#region Screens
	import TimerDemo from './demos/TimerDemo.svelte'
	import TreeViewDemo from './demos/TreeViewDemo.svelte'
	import ComboboxDemo from './demos/ComboboxDemo.svelte'
	import JsonViewerDemo from './demos/JsonViewerDemo.svelte'
	import FilePickerDemo from './demos/FilePickerDemo.svelte'
	import ScrollViewDemo from './demos/ScrollViewDemo.svelte'
	import GradientDemo from './demos/GradientDemo.svelte'
	//#endregion Screens

	//#region Menu Data
	type DemoName =
		| 'timer'
		| 'treeview'
		| 'combobox'
		| 'jsonviewer'
		| 'filepicker'
		| 'scrollview'
		| 'gradient'

	const DEMOS: Array<{ key: DemoName; label: string }> = [
		{ key: 'timer', label: 'Timer / Countdown / Stopwatch' },
		{ key: 'treeview', label: 'TreeView' },
		{ key: 'combobox', label: 'Combobox (Autocomplete)' },
		{ key: 'jsonviewer', label: 'JsonViewer' },
		{ key: 'filepicker', label: 'FilePicker' },
		{ key: 'scrollview', label: 'ScrollView' },
		{ key: 'gradient', label: 'Gradient (ink-gradient port)' },
	]
	//#endregion Menu Data

	//#region State
	let activeDemo = $state<DemoName | null>(null)
	let focused = $state(0)
	//#endregion State

	//#region Input
	function goBack() {
		activeDemo = null
	}

	useInput((_input, key) => {
		if (activeDemo !== null) return
		if (key.downArrow) focused = Math.min(focused + 1, DEMOS.length - 1)
		if (key.upArrow) focused = Math.max(focused - 1, 0)
		if (key.return) {
			const demo = DEMOS[focused]
			if (demo) activeDemo = demo.key
		}
	})
	//#endregion Input
</script>
<!-- #endregion Script -->

<!-- #region Template -->
{#if activeDemo === 'timer'}
	<TimerDemo onBack={goBack} />
{:else if activeDemo === 'treeview'}
	<TreeViewDemo onBack={goBack} />
{:else if activeDemo === 'combobox'}
	<ComboboxDemo onBack={goBack} />
{:else if activeDemo === 'jsonviewer'}
	<JsonViewerDemo onBack={goBack} />
{:else if activeDemo === 'filepicker'}
	<FilePickerDemo onBack={goBack} />
{:else if activeDemo === 'scrollview'}
	<ScrollViewDemo onBack={goBack} />
{:else if activeDemo === 'gradient'}
	<GradientDemo onBack={goBack} />
{:else}
	<Box style={{ flexDirection: 'column', padding: 1 }}>
		<Text style={{ fontWeight: 'bold', color: 'cyan' }}>
			wolf-tui Community Components Showcase
		</Text>
		<Text style={{ dimColor: true }}>
			Use ↑↓ to navigate, Enter to select, Ctrl+C to exit
		</Text>
		<Box style={{ flexDirection: 'column', marginTop: 1 }}>
			{#each DEMOS as demo, i}
				<Text style={{ color: i === focused ? 'blue' : undefined }}>
					{i === focused ? '❯ ' : '  '}{demo.label}
				</Text>
			{/each}
		</Box>
	</Box>
{/if}
<!-- #endregion Template -->
