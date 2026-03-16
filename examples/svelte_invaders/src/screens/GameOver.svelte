<script lang="ts">
	import { Box, Text, useInput, Alert } from '@wolfie/svelte'
	import type { Screen } from '../composables/useInvaders.svelte'
	import { BRAND } from '../theme'

	//#region Props
	let { score, wave, onNavigate, onRestart }: {
		score: number
		wave: number
		onNavigate: (screen: Screen) => void
		onRestart: () => void
	} = $props()
	//#endregion Props

	//#region ASCII Art
	const GAME_OVER_ASCII = `
  ____    _    __  __ _____    _____     _______ ____
 / ___|  / \\  |  \\/  | ____|  / _ \\ \\   / / ____|  _ \\
| |  _  / _ \\ | |\\/| |  _|   | | | \\ \\ / /|  _| | |_) |
| |_| |/ ___ \\| |  | | |___  | |_| |\\ V / | |___|  _ <
 \\____/_/   \\_\\_|  |_|_____|  \\___/  \\_/  |_____|_| \\_\\
`
	//#endregion ASCII Art

	let formattedScore = $derived(score.toString().padStart(6, '0'))

	useInput((input, key) => {
		if (key.return || input === 'r') {
			onRestart()
		} else if (input === 'h') {
			onNavigate('highscores')
		} else if (key.escape || input === 'q') {
			onNavigate('menu')
		}
	})
</script>

<Box
	style={{
		width: '100vw',
		height: '100vh',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: BRAND.bgDark,
	}}
>
	<Text style={{ color: BRAND.error }} className="font-bold">
		{GAME_OVER_ASCII}
	</Text>

	<Box style={{ marginTop: 2, width: '60%' }}>
		<Alert variant="success" title="Game Over">
			Final score: {formattedScore} — Wave {wave}
		</Alert>
	</Box>

	<Box
		style={{ marginTop: 3, flexDirection: 'column', alignItems: 'center' }}
	>
		<Text style={{ color: BRAND.primary }} className="font-bold">
			[R] Retry
		</Text>
		<Text style={{ color: BRAND.textMuted }}>
			[H] High Scores • [Q] Menu
		</Text>
	</Box>
</Box>
