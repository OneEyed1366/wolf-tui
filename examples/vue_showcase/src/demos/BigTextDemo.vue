<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box, Text, useInput, BigText, type BigTextFont } from '@wolf-tui/vue'

const props = defineProps<{ onBack: () => void }>()

//#region State
const FONTS: readonly BigTextFont[] = [
	'block',
	'slick',
	'tiny',
	'grid',
	'pallet',
	'shade',
	'simple',
	'simpleBlock',
	'3d',
	'simple3d',
	'chrome',
	'huge',
] as const

const FONT_KEYS: readonly string[] = [
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'0',
	'-',
	'=',
]

type ColorMode = 'solo' | 'gradient' | 'default'
const COLOR_MODES: readonly ColorMode[] = [
	'solo',
	'gradient',
	'default',
] as const

const fontIndex = ref(0)
const colorModeIndex = ref(0)

const currentFont = computed<BigTextFont>(() => FONTS[fontIndex.value]!)
const currentColorMode = computed<ColorMode>(
	() => COLOR_MODES[colorModeIndex.value]!
)

const soloColors = computed<readonly string[]>(() => ['cyan'])
const gradientColors = computed<readonly string[]>(() => ['red', 'blue'])
//#endregion State

//#region Input
useInput((input, key) => {
	if (key.escape) {
		props.onBack()
		return
	}
	const idx = FONT_KEYS.indexOf(input)
	if (idx !== -1) {
		fontIndex.value = idx
		return
	}
	if (input === 'c' || input === 'C') {
		colorModeIndex.value = (colorModeIndex.value + 1) % COLOR_MODES.length
	}
})
//#endregion Input
</script>

<script lang="ts">
export default { name: 'BigTextDemo' }
</script>

<template>
	<Box :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ fontWeight: 'bold', color: 'cyan' }">BigText Demo</Text>
		<Text :style="{ dimColor: true }">
			BigText Demo — 1-9/0/-/= switch font, C cycle color mode, Esc back
		</Text>
		<Text :style="{ marginTop: 1 }">Font: {{ currentFont }}</Text>
		<Text :style="{ dimColor: true }">Color mode: {{ currentColorMode }}</Text>
		<Box :style="{ marginTop: 1 }">
			<BigText
				v-if="currentColorMode === 'solo'"
				text="WOLF"
				:font="currentFont"
				:colors="soloColors"
				:space="false"
				align="center"
			/>
			<BigText
				v-else-if="currentColorMode === 'gradient'"
				text="WOLF"
				:font="currentFont"
				:gradient="gradientColors"
				:space="false"
				align="center"
			/>
			<BigText
				v-else
				text="WOLF"
				:font="currentFont"
				:space="false"
				align="center"
			/>
		</Box>
	</Box>
</template>
