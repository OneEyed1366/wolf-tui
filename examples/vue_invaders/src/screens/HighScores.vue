<script setup lang="ts">
import { ref, computed } from 'vue'
import {
	Box,
	Text,
	TextInput,
	PasswordInput,
	EmailInput,
	Newline,
	Table,
	useInput,
} from '@wolf-tui/vue'
import type { Screen } from '../composables/useInvaders'
import { BRAND } from '../theme'

//#region Props
const props = defineProps<{
	score?: number
	onNavigate: (screen: Screen) => void
}>()
//#endregion Props

//#region Types
type HighScoreEntry = {
	name: string
	email: string
	score: number
	date: string
}
//#endregion Types

//#region Mock High Scores
const MOCK_HIGH_SCORES: HighScoreEntry[] = [
	{ name: 'ACE', email: 'ace@game.com', score: 15000, date: '2025-01-15' },
	{
		name: 'BLASTER',
		email: 'blaster@game.com',
		score: 12500,
		date: '2025-01-14',
	},
	{
		name: 'COSMIC',
		email: 'cosmic@game.com',
		score: 10000,
		date: '2025-01-13',
	},
	{ name: 'DOOM', email: 'doom@game.com', score: 8500, date: '2025-01-12' },
	{ name: 'EAGLE', email: 'eagle@game.com', score: 7000, date: '2025-01-11' },
]
//#endregion Mock High Scores

//#region State
type Step = 'view' | 'name' | 'email' | 'password'
const step = ref<Step>('view')
const name = ref('')
const email = ref('')
const scores = ref<HighScoreEntry[]>([...MOCK_HIGH_SCORES])
//#endregion State

//#region Computed
const isNewHighScore = computed(() => {
	return (
		props.score !== undefined &&
		props.score > (scores.value[scores.value.length - 1]?.score ?? 0)
	)
})

const scoreRows = computed(() =>
	scores.value.map((entry, index) => ({
		rank: index + 1,
		name: entry.name,
		score: entry.score,
		date: entry.date,
	}))
)
//#endregion Computed

//#region Input Handling
useInput((input, key) => {
	if (step.value === 'view' && (key.escape || input === 'q')) {
		props.onNavigate('menu')
	}
})

function handleNameSubmit(value: string) {
	name.value = value
	step.value = 'email'
}

function handleEmailSubmit(value: string) {
	email.value = value
	step.value = 'password'
}

function handlePasswordSubmit(_password: string) {
	// In a real app, we would save to server
	if (props.score !== undefined) {
		const newEntry: HighScoreEntry = {
			name: name.value.toUpperCase().slice(0, 10),
			email: email.value,
			score: props.score,
			date: new Date().toISOString().split('T')[0] ?? '',
		}
		const newScores = [...scores.value, newEntry]
			.sort((a, b) => b.score - a.score)
			.slice(0, 5)
		scores.value = newScores
	}
	step.value = 'view'
}
//#endregion Input Handling
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
			padding: 2,
		}"
	>
		<Text :style="{ color: BRAND.primary }" class="font-bold text-lg"
			>🏆 HIGH SCORES</Text
		>
		<Newline />

		<!-- View Mode -->
		<template v-if="step === 'view'">
			<Table :data="scoreRows" :columns="['rank', 'name', 'score', 'date']" />

			<Newline />
			<template v-if="isNewHighScore && score !== undefined">
				<Text class="text-yellow font-bold">
					NEW HIGH SCORE: {{ score }}! Press Enter to save.
				</Text>
				<Newline />
			</template>
			<Text class="text-gray">Press ESC or Q to return to menu</Text>
		</template>

		<!-- Name Entry -->
		<Box v-if="step === 'name'" :style="{ flexDirection: 'column' }">
			<Text class="text-yellow">Enter your name (max 10 chars):</Text>
			<Newline />
			<TextInput placeholder="Your name…" @submit="handleNameSubmit" />
		</Box>

		<!-- Email Entry -->
		<Box v-if="step === 'email'" :style="{ flexDirection: 'column' }">
			<Text class="text-yellow">Enter your email for leaderboard:</Text>
			<Newline />
			<EmailInput placeholder="your@email.com" @submit="handleEmailSubmit" />
		</Box>

		<!-- Password Entry -->
		<Box v-if="step === 'password'" :style="{ flexDirection: 'column' }">
			<Text class="text-yellow">Create a password to protect your score:</Text>
			<Newline />
			<PasswordInput placeholder="Password…" @submit="handlePasswordSubmit" />
		</Box>
	</Box>
</template>
