<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box, Text, useInput } from '@wolf-tui/vue'
import TimerDemo from './demos/TimerDemo.vue'
import TreeViewDemo from './demos/TreeViewDemo.vue'
import ComboboxDemo from './demos/ComboboxDemo.vue'
import JsonViewerDemo from './demos/JsonViewerDemo.vue'
import FilePickerDemo from './demos/FilePickerDemo.vue'
import BigTextDemo from './demos/BigTextDemo.vue'
import TableDemo from './demos/TableDemo.vue'
import ScrollViewDemo from './demos/ScrollViewDemo.vue'
import GradientDemo from './demos/GradientDemo.vue'

//#region Menu
type DemoName =
	| 'timer'
	| 'treeview'
	| 'combobox'
	| 'jsonviewer'
	| 'filepicker'
	| 'bigtext'
	| 'table'
	| 'scrollview'
	| 'gradient'

const DEMOS: Array<{ key: DemoName; label: string }> = [
	{ key: 'timer', label: 'Timer / Countdown / Stopwatch' },
	{ key: 'treeview', label: 'TreeView' },
	{ key: 'combobox', label: 'Combobox (Autocomplete)' },
	{ key: 'jsonviewer', label: 'JsonViewer' },
	{ key: 'filepicker', label: 'FilePicker' },
	{ key: 'bigtext', label: 'BigText (cfonts)' },
	{ key: 'table', label: 'Table' },
	{ key: 'scrollview', label: 'ScrollView' },
	{ key: 'gradient', label: 'Gradient (ink-gradient port)' },
]

const activeDemo = ref<DemoName | null>(null)
const focused = ref(0)

const showMenu = computed(() => activeDemo.value === null)

function handleBack() {
	activeDemo.value = null
}

useInput((_input, key) => {
	if (!showMenu.value) return
	if (key.downArrow)
		focused.value = Math.min(focused.value + 1, DEMOS.length - 1)
	if (key.upArrow) focused.value = Math.max(focused.value - 1, 0)
	if (key.return) activeDemo.value = DEMOS[focused.value]!.key
})
//#endregion Menu
</script>

<template>
	<!-- #region Demos -->
	<TimerDemo v-if="activeDemo === 'timer'" :on-back="handleBack" />
	<TreeViewDemo v-if="activeDemo === 'treeview'" :on-back="handleBack" />
	<ComboboxDemo v-if="activeDemo === 'combobox'" :on-back="handleBack" />
	<JsonViewerDemo v-if="activeDemo === 'jsonviewer'" :on-back="handleBack" />
	<FilePickerDemo v-if="activeDemo === 'filepicker'" :on-back="handleBack" />
	<BigTextDemo v-if="activeDemo === 'bigtext'" :on-back="handleBack" />
	<TableDemo v-if="activeDemo === 'table'" :on-back="handleBack" />
	<ScrollViewDemo v-if="activeDemo === 'scrollview'" :on-back="handleBack" />
	<GradientDemo v-if="activeDemo === 'gradient'" :on-back="handleBack" />
	<!-- #endregion Demos -->

	<!-- #region Menu -->
	<Box v-if="showMenu" :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ fontWeight: 'bold', color: 'cyan' }">
			wolf-tui Community Components Showcase
		</Text>
		<Text :style="{ dimColor: true }">
			Use arrow-keys to navigate, Enter to select, Ctrl+C to exit
		</Text>
		<Box :style="{ flexDirection: 'column', marginTop: 1 }">
			<Text
				v-for="(demo, i) in DEMOS"
				:key="demo.key"
				:style="{ color: i === focused ? 'blue' : undefined }"
			>
				{{ i === focused ? '> ' : '  ' }}{{ demo.label }}
			</Text>
		</Box>
	</Box>
	<!-- #endregion Menu -->
</template>
