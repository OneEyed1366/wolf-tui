<script lang="ts">
	import { Box, Text, Newline, useInput } from '@wolfie/svelte'
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

	// score prop reserved for future "your score" display
</script>

<Box
	style={{
		width: '100vw',
		height: '100vh',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: BRAND.bgDark,
		padding: 2,
	}}
>
	<Text style={{ color: BRAND.primary }} className="font-bold text-lg">
		🏆 HIGH SCORES
	</Text>
	<Newline />

	<Box style={{ flexDirection: 'column' }}>
		<Box>
			<Text className="text-yellow">{'RANK'.padEnd(6)}</Text>
			<Text className="text-yellow">{'NAME'.padEnd(12)}</Text>
			<Text className="text-yellow">{'SCORE'.padStart(8)}</Text>
			<Text className="text-yellow">{'  DATE'.padEnd(12)}</Text>
		</Box>
		<Newline />

		{#each MOCK_HIGH_SCORES as entry, index}
			<Box>
				<Text className="text-white">{`${index + 1}.`.padEnd(6)}</Text>
				<Text className="text-green">{entry.name.padEnd(12)}</Text>
				<Text className="text-cyan">{entry.score.toString().padStart(8)}</Text>
				<Text className="text-gray">{'  ' + entry.date}</Text>
			</Box>
		{/each}
	</Box>

	<Newline />
	<Text className="text-gray">Press ESC or Q to return to menu</Text>
</Box>
