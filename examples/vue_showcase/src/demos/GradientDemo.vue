<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box, Text, useInput, Gradient } from '@wolf-tui/vue'
import type { GradientName } from '@wolf-tui/vue'

const props = defineProps<{ onBack: () => void }>()

//#region Data
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
//#endregion Data

const presetIndex = ref(0)
const current = computed<GradientName>(() => PRESETS[presetIndex.value]!)

useInput((_input, key) => {
	if (key.escape) props.onBack()
	if (key.rightArrow)
		presetIndex.value = (presetIndex.value + 1) % PRESETS.length
	if (key.leftArrow)
		presetIndex.value =
			(presetIndex.value - 1 + PRESETS.length) % PRESETS.length
})
</script>

<script lang="ts">
export default { name: 'GradientDemo' }
</script>

<template>
	<Box :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ fontWeight: 'bold', color: 'cyan' }">Gradient Demo</Text>
		<Text :style="{ dimColor: true }"> ← → = cycle presets | Esc = back </Text>

		<Box :style="{ flexDirection: 'column', marginTop: 1 }">
			<Text :style="{ dimColor: true }">Preset: {{ current }}</Text>
			<Gradient :name="current">{{ SAMPLE_TEXT }}</Gradient>
		</Box>

		<Box :style="{ flexDirection: 'column', marginTop: 1 }">
			<Text :style="{ dimColor: true }">Custom colors (red → gold):</Text>
			<Gradient :colors="['#ff3366', '#ffd700']">Hand-picked stops</Gradient>
		</Box>

		<Box :style="{ flexDirection: 'column', marginTop: 1 }">
			<Text :style="{ dimColor: true }">All presets at a glance:</Text>
			<Gradient v-for="name in PRESETS" :key="name" :name="name">
				{{ name.padEnd(10, ' ') }} {{ SAMPLE_TEXT }}
			</Gradient>
		</Box>
	</Box>
</template>
