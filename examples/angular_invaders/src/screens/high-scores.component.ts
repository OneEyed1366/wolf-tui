import {
	Component,
	ChangeDetectionStrategy,
	inject,
	signal,
	computed,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	TextInputComponent,
	EmailInputComponent,
	PasswordInputComponent,
	TableComponent,
	injectInput,
} from '@wolf-tui/angular'
import { InvadersService } from '../services/invaders.service'
import { BRAND } from '../theme'

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

//#region HighScoresComponent
@Component({
	selector: 'app-high-scores',
	standalone: true,
	imports: [
		BoxComponent,
		TextComponent,
		TextInputComponent,
		EmailInputComponent,
		PasswordInputComponent,
		TableComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box
			[style]="{
				width: '100vw',
				height: '100vh',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: brand.bgDark,
				padding: 2,
			}"
		>
			<w-text [style]="{ color: brand.primary }" className="font-bold text-lg"
				>🏆 HIGH SCORES</w-text
			>
			<w-text> </w-text>

			@if (step() === 'view') {
				<w-table
					[data]="scoreRows()"
					[columns]="['rank', 'name', 'score', 'date']"
				/>

				<w-text> </w-text>
				<w-text className="text-gray"
					>Press N to add entry • ESC or Q to return to menu</w-text
				>
			}

			@if (step() === 'name') {
				<w-box [style]="{ flexDirection: 'column' }">
					<w-text className="text-yellow"
						>Enter your name (max 10 chars):</w-text
					>
					<w-text> </w-text>
					<w-text-input
						placeholder="Your name..."
						(submitValue)="onNameSubmit($event)"
					/>
				</w-box>
			}

			@if (step() === 'email') {
				<w-box [style]="{ flexDirection: 'column' }">
					<w-text className="text-yellow"
						>Enter your email for leaderboard:</w-text
					>
					<w-text> </w-text>
					<w-email-input
						placeholder="your@email.com"
						(submitValue)="onEmailSubmit($event)"
					/>
				</w-box>
			}

			@if (step() === 'password') {
				<w-box [style]="{ flexDirection: 'column' }">
					<w-text className="text-yellow"
						>Create a password to protect your score:</w-text
					>
					<w-text> </w-text>
					<w-password-input
						placeholder="Password..."
						(submitValue)="onPasswordSubmit($event)"
					/>
				</w-box>
			}
		</w-box>
	`,
})
export class HighScoresComponent {
	readonly brand = BRAND
	private readonly invaders = inject(InvadersService)

	readonly step = signal<'view' | 'name' | 'email' | 'password'>('view')
	readonly scores = signal<HighScoreEntry[]>(MOCK_HIGH_SCORES)
	readonly scoreRows = computed(() =>
		this.scores().map((entry, index) => ({
			rank: index + 1,
			name: entry.name,
			score: entry.score,
			date: entry.date,
		}))
	)

	private name = ''
	private email = ''

	constructor() {
		injectInput(
			(input, key) => {
				if (this.step() === 'view') {
					if (key.escape || input === 'q') {
						this.invaders.navigate('menu')
					} else if (input === 'n') {
						this.step.set('name')
					}
				}
			},
			{ isActive: () => this.invaders.screen() === 'highscores' }
		)
	}

	onNameSubmit(value: string) {
		this.name = value
		this.step.set('email')
	}

	onEmailSubmit(value: string) {
		this.email = value
		this.step.set('password')
	}

	onPasswordSubmit(_password: string) {
		const score = this.invaders.state().score
		const newEntry: HighScoreEntry = {
			name: this.name.toUpperCase().slice(0, 10),
			email: this.email,
			score,
			date: new Date().toISOString().split('T')[0] ?? '',
		}
		const newScores = [...this.scores(), newEntry]
			.sort((a, b) => b.score - a.score)
			.slice(0, 5)
		this.scores.set(newScores)
		this.step.set('view')
	}
}
//#endregion HighScoresComponent
