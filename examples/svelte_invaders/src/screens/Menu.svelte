<script lang="ts">
	import { Box, Text, useInput } from '@wolfie/svelte'
	import type { Screen } from '../composables/useInvaders.svelte'
	import { useQuit } from '../composables/useQuit'
	import { BRAND } from '../theme'

	//#region Props
	let { onNavigate, onStartGame }: {
		onNavigate: (screen: Screen) => void
		onStartGame: () => void
	} = $props()
	//#endregion Props

	//#region Menu Options
	const MENU_OPTIONS = [
		{ label: 'Start Game', value: 'start' },
		{ label: 'High Scores', value: 'highscores' },
		{ label: 'Settings', value: 'settings' },
		{ label: 'Help', value: 'help' },
		{ label: 'Quit', value: 'quit' },
	]
	//#endregion Menu Options

	//#region ASCII Logo
	const LOGO = `
 ____  ____   _    ____ _____   ___ _   ___     ___    ____  _____ ____  ____
/ ___||  _ \\ / \\  / ___| ____| |_ _| \\ | \\ \\   / / \\  |  _ \\| ____|  _ \\/ ___|
\\___ \\| |_) / _ \\| |   |  _|    | ||  \\| |\\ \\ / / _ \\ | | | |  _| | |_) \\___ \\
 ___) |  __/ ___ \\ |___| |___   | || |\\  | \\ V / ___ \\| |_| | |___|  _ < ___) |
|____/|_| /_/   \\_\\____|_____| |___|_| \\_|  \\_/_/   \\_\\____/|_____|_| \\_\\____/
`
	//#endregion ASCII Logo

	const quit = useQuit()
	let selectedIndex = $state(0)

	function handleSelect(value: string) {
		switch (value) {
			case 'start':
				onStartGame()
				break
			case 'highscores':
				onNavigate('highscores')
				break
			case 'settings':
				onNavigate('settings')
				break
			case 'help':
				onNavigate('help')
				break
			case 'quit':
				quit()
				break
		}
	}

	useInput((input, key) => {
		if (key.upArrow) {
			selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : MENU_OPTIONS.length - 1
		} else if (key.downArrow) {
			selectedIndex = selectedIndex < MENU_OPTIONS.length - 1 ? selectedIndex + 1 : 0
		} else if (key.return) {
			const opt = MENU_OPTIONS[selectedIndex]
			if (opt) handleSelect(opt.value)
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
	<Text style={{ color: BRAND.primary }} className="font-bold">
		{LOGO}
	</Text>

	<Box style={{ marginTop: 2, marginBottom: 1 }}>
		<Text className="text-gray">↑/↓ Navigate • Enter Select</Text>
	</Box>

	<Box style={{ flexDirection: 'column' }}>
		{#each MENU_OPTIONS as option, index}
			<Text
				style={{
					color: index === selectedIndex ? BRAND.primary : BRAND.textMuted,
				}}
				className={index === selectedIndex ? 'font-bold' : undefined}
			>
				{index === selectedIndex ? '❯ ' : '  '}{option.label}
			</Text>
		{/each}
	</Box>

	<Box
		style={{
			position: 'absolute',
			bottom: 1,
			width: '100vw',
			justifyContent: 'center',
		}}
	>
		<Text style={{ color: BRAND.textMuted }}>
			v1.0 • {BRAND.name} Space Invaders
		</Text>
	</Box>
</Box>
