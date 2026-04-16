import { Box, Text, Newline, Table, useInput } from '@wolf-tui/solid'
import type { Screen } from '../composables/useInvaders'
import { BRAND } from '../theme'

//#region Props
type HighScoresProps = {
	score?: number
	onNavigate: (screen: Screen) => void
}
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

//#region Component
export default function HighScores(props: HighScoresProps) {
	useInput((input, key) => {
		if (key.escape || input === 'q') {
			props.onNavigate('menu')
		}
	})

	return (
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

			<Table
				data={MOCK_HIGH_SCORES.map((entry, index) => ({
					rank: index + 1,
					name: entry.name,
					score: entry.score,
					date: entry.date,
				}))}
				columns={['rank', 'name', 'score', 'date']}
			/>

			<Newline />
			<Text className="text-gray">Press ESC or Q to return to menu</Text>
		</Box>
	)
}
//#endregion Component
