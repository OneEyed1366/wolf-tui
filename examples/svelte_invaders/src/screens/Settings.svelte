<script lang="ts">
	import { Box, Text, Newline, useInput } from '@wolfie/svelte'
	import type {
		Screen,
		Settings as SettingsType,
		Difficulty,
	} from '../composables/useInvaders.svelte'
	import { BRAND } from '../theme'

	//#region Props
	let { settings, onUpdateSettings, onNavigate }: {
		settings: SettingsType
		onUpdateSettings: (settings: Partial<SettingsType>) => void
		onNavigate: (screen: Screen) => void
	} = $props()
	//#endregion Props

	//#region Options
	const DIFFICULTY_OPTIONS: { label: string; value: Difficulty }[] = [
		{ label: 'Easy - Slower aliens', value: 'easy' },
		{ label: 'Normal - Standard', value: 'normal' },
		{ label: 'Hard - Fast aliens', value: 'hard' },
	]

	const TOGGLE_OPTIONS = [
		{ label: 'Show FPS Counter', key: 'showFps' as const },
		{ label: 'Shield Health Bars', key: 'shieldBars' as const },
		{ label: 'Kill Log', key: 'killLog' as const },
		{ label: 'Alien Animation', key: 'alienAnim' as const },
		{ label: 'Debug Mode', key: 'debug' as const },
	]
	//#endregion Options

	let section = $state<'difficulty' | 'options'>('difficulty')
	let diffIndex = $state(
		DIFFICULTY_OPTIONS.findIndex((d) => d.value === settings.difficulty)
	)
	let optionIndex = $state(0)

	let currentToggles = $derived({
		showFps: settings.showFps,
		shieldBars: settings.shieldBars,
		killLog: settings.killLog,
		alienAnim: settings.alienAnim,
		debug: settings.debug,
	} as Record<string, boolean>)

	useInput((input, key) => {
		if (key.escape || input === 'q') {
			onNavigate('menu')
			return
		}
		if (key.tab) {
			section = section === 'difficulty' ? 'options' : 'difficulty'
			return
		}

		if (section === 'difficulty') {
			if (key.upArrow) {
				diffIndex = diffIndex > 0 ? diffIndex - 1 : DIFFICULTY_OPTIONS.length - 1
			} else if (key.downArrow) {
				diffIndex = diffIndex < DIFFICULTY_OPTIONS.length - 1 ? diffIndex + 1 : 0
			} else if (key.return) {
				const opt = DIFFICULTY_OPTIONS[diffIndex]
				if (opt && opt.value !== settings.difficulty) {
					onUpdateSettings({ difficulty: opt.value })
				}
			}
		} else {
			if (key.upArrow) {
				optionIndex = optionIndex > 0 ? optionIndex - 1 : TOGGLE_OPTIONS.length - 1
			} else if (key.downArrow) {
				optionIndex = optionIndex < TOGGLE_OPTIONS.length - 1 ? optionIndex + 1 : 0
			} else if (key.return || input === ' ') {
				const opt = TOGGLE_OPTIONS[optionIndex]
				if (opt) {
					onUpdateSettings({
						[opt.key]: !currentToggles[opt.key],
					})
				}
			}
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
		padding: 2,
	}}
>
	<Text style={{ color: BRAND.primary }} className="font-bold text-lg">
		⚙ SETTINGS
	</Text>
	<Newline />

	<Text
		className={section === 'difficulty' ? 'text-yellow font-bold' : 'text-gray'}
	>
		Difficulty:{section !== 'difficulty' ? ' (Tab to switch)' : ''}
	</Text>
	<Box style={{ flexDirection: 'column' }}>
		{#each DIFFICULTY_OPTIONS as opt, index}
			<Text
				style={{
					color:
						section === 'difficulty' && index === diffIndex
							? BRAND.primary
							: opt.value === settings.difficulty
								? BRAND.success
								: BRAND.textMuted,
				}}
			>
				{section === 'difficulty' && index === diffIndex ? '❯ ' : '  '}{opt.value === settings.difficulty ? '● ' : '○ '}{opt.label}
			</Text>
		{/each}
	</Box>

	<Newline />
	<Text
		className={section === 'options' ? 'text-yellow font-bold' : 'text-gray'}
	>
		Options:{section !== 'options' ? ' (Tab to switch)' : ''}
	</Text>
	<Box style={{ flexDirection: 'column' }}>
		{#each TOGGLE_OPTIONS as opt, index}
			<Text
				style={{
					color:
						section === 'options' && index === optionIndex
							? BRAND.primary
							: BRAND.textMuted,
				}}
			>
				{section === 'options' && index === optionIndex ? '❯ ' : '  '}{currentToggles[opt.key] ? '☑ ' : '☐ '}{opt.label}
			</Text>
		{/each}
	</Box>

	<Newline />
	<Text className="text-gray">
		Tab Switch • ↑/↓ Navigate • Enter/Space Toggle • Esc Menu
	</Text>
</Box>
