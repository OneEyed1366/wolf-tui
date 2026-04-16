import { useState } from 'react'
import {
	Box,
	Text,
	TextInput,
	PasswordInput,
	EmailInput,
	Newline,
	Table,
	useInput,
} from '@wolf-tui/react'
import type { Screen } from '../hooks/useInvaders'
import { BRAND } from '../theme'

//#region Types
type HighScoresProps = {
	score?: number
	onNavigate: (screen: Screen) => void
}

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
export function HighScores({ score, onNavigate }: HighScoresProps) {
	const [step, setStep] = useState<'view' | 'name' | 'email' | 'password'>(
		'view'
	)
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [scores, setScores] = useState(MOCK_HIGH_SCORES)
	const isNewHighScore =
		score !== undefined && score > (scores[scores.length - 1]?.score ?? 0)

	useInput((input, key) => {
		if (step === 'view' && (key.escape || input === 'q')) {
			onNavigate('menu')
		}
	})

	const handleNameSubmit = (value: string) => {
		setName(value)
		setStep('email')
	}

	const handleEmailSubmit = (value: string) => {
		setEmail(value)
		setStep('password')
	}

	const handlePasswordSubmit = (_password: string) => {
		// In a real app, we would save to server
		if (score !== undefined) {
			const newEntry: HighScoreEntry = {
				name: name.toUpperCase().slice(0, 10),
				email,
				score,
				date: new Date().toISOString().split('T')[0] ?? '',
			}
			const newScores = [...scores, newEntry]
				.sort((a, b) => b.score - a.score)
				.slice(0, 5)
			setScores(newScores)
		}
		setStep('view')
	}

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

			{step === 'view' && (
				<>
					<Table
						data={scores.map((entry, index) => ({
							rank: index + 1,
							name: entry.name,
							score: entry.score,
							date: entry.date,
						}))}
						columns={['rank', 'name', 'score', 'date']}
					/>

					<Newline />
					{isNewHighScore && score !== undefined && (
						<>
							<Text className="text-yellow font-bold">
								NEW HIGH SCORE: {score}! Press Enter to save.
							</Text>
							<Newline />
						</>
					)}
					<Text className="text-gray">Press ESC or Q to return to menu</Text>
				</>
			)}

			{step === 'name' && (
				<Box style={{ flexDirection: 'column' }}>
					<Text className="text-yellow">Enter your name (max 10 chars):</Text>
					<Newline />
					<TextInput placeholder="Your name…" onSubmit={handleNameSubmit} />
				</Box>
			)}

			{step === 'email' && (
				<Box style={{ flexDirection: 'column' }}>
					<Text className="text-yellow">Enter your email for leaderboard:</Text>
					<Newline />
					<EmailInput
						placeholder="your@email.com"
						onSubmit={handleEmailSubmit}
					/>
				</Box>
			)}

			{step === 'password' && (
				<Box style={{ flexDirection: 'column' }}>
					<Text className="text-yellow">
						Create a password to protect your score:
					</Text>
					<Newline />
					<PasswordInput
						placeholder="Password…"
						onSubmit={handlePasswordSubmit}
					/>
				</Box>
			)}
		</Box>
	)
}
//#endregion Component
