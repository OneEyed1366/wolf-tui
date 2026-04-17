<script setup lang="ts">
import {
	Box,
	Text,
	Select,
	BigText,
	useFocusManager,
	useInput,
} from '@wolf-tui/vue'
import type { Screen } from '../composables/useInvaders'
import { useQuit } from '../composables/useQuit'
import { BRAND } from '../theme'

//#region Props & Emits
const props = defineProps<{
	onNavigate: (screen: Screen) => void
	onStartGame: () => void
}>()
//#endregion Props & Emits

//#region Menu Options
const MENU_OPTIONS = [
	{ label: 'Start Game', value: 'start' },
	{ label: 'High Scores', value: 'highscores' },
	{ label: 'Settings', value: 'settings' },
	{ label: 'Help', value: 'help' },
	{ label: 'Quit', value: 'quit' },
]
//#endregion Menu Options

//#region Logic
const quit = useQuit()
const { focusNext, focusPrevious } = useFocusManager()

useInput((input, key) => {
	if (key.tab) {
		if (key.shift) {
			focusPrevious()
		} else {
			focusNext()
		}
	}
})

function handleChange(value: string) {
	switch (value) {
		case 'start':
			props.onStartGame()
			break
		case 'highscores':
			props.onNavigate('highscores')
			break
		case 'settings':
			props.onNavigate('settings')
			break
		case 'help':
			props.onNavigate('help')
			break
		case 'quit':
			quit()
			break
	}
}
//#endregion Logic
</script>

<template>
	<Box
		:style="{
			width: '100vw',
			height: '100vh',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: BRAND.bgDark,
		}"
	>
		<BigText text="INVADERS" font="block" :colors="[BRAND.primary]" />

		<Box :style="{ marginTop: 2, marginBottom: 1 }">
			<Text class="text-gray">↑/↓ Navigate • Enter Select</Text>
		</Box>

		<Select :options="MENU_OPTIONS" @change="handleChange" />

		<Box
			:style="{
				position: 'absolute',
				bottom: 1,
				width: '100vw',
				justifyContent: 'center',
			}"
		>
			<Text :style="{ color: BRAND.textMuted }"
				>v1.0 • {{ BRAND.name }} Space Invaders</Text
			>
		</Box>
	</Box>
</template>
