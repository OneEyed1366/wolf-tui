<script lang="ts">
	import { Box, Text, BigText, useInput } from '@wolf-tui/svelte'
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
		} else if (input === 'q' || key.escape) {
			quit()
		}
	})
</script>

<Box className={[{ width: '100vw', height: '100vh', backgroundColor: BRAND.bgDark }, 'flex-col items-center justify-center']}>
	<BigText text="INVADERS" font="tiny" colors={[BRAND.primary]} space={false} />

	<Box className="mt-2 mb-1">
		<Text className="text-gray">↑/↓ Navigate • Enter Select</Text>
	</Box>

	<Box className="flex-col">
		{#each MENU_OPTIONS as option, index}
			<Text
				className={index === selectedIndex ? [{ color: BRAND.primary }, 'font-bold'] : { color: BRAND.textMuted }}
			>
				{index === selectedIndex ? '❯ ' : '  '}{option.label}
			</Text>
		{/each}
	</Box>

	<Box className={['absolute justify-center', { bottom: 1, width: '100vw' }]}>
		<Text className={{ color: BRAND.textMuted }}>
			v1.0 • {BRAND.name} Space Invaders
		</Text>
	</Box>
</Box>
