<script lang="ts">
	import { Box, Text, Newline, Table, useInput } from '@wolf-tui/svelte'
	import type { Screen } from '../composables/useInvaders.svelte'
	import { BRAND } from '../theme'

	//#region Props
	let { score, onNavigate }: {
		score?: number
		onNavigate: (screen: Screen) => void
	} = $props()
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
		{ name: 'BLASTER', email: 'blaster@game.com', score: 12500, date: '2025-01-14' },
		{ name: 'COSMIC', email: 'cosmic@game.com', score: 10000, date: '2025-01-13' },
		{ name: 'DOOM', email: 'doom@game.com', score: 8500, date: '2025-01-12' },
		{ name: 'EAGLE', email: 'eagle@game.com', score: 7000, date: '2025-01-11' },
	]
	//#endregion Mock High Scores

	useInput((input, key) => {
		if (key.escape || input === 'q') {
			onNavigate('menu')
		}
	})

	const scoreRows = MOCK_HIGH_SCORES.map((entry, index) => ({
		rank: index + 1,
		name: entry.name,
		score: entry.score,
		date: entry.date,
	}))

	// score prop reserved for future "your score" display
</script>

<Box className={[{ width: '100vw', height: '100vh', backgroundColor: BRAND.bgDark }, 'flex-col items-center justify-center p-2']}>
	<Text className={[{ color: BRAND.primary }, 'font-bold text-lg']}>
		🏆 HIGH SCORES
	</Text>
	<Newline />

	<Table data={scoreRows} columns={['rank', 'name', 'score', 'date']} />

	<Newline />
	<Text className="text-gray">Press ESC or Q to return to menu</Text>
</Box>
