<!-- #region Script -->
<script lang="ts">
	import {
		Box,
		Text,
		useInput,
		BigText,
		type BigTextFont,
		type BigTextGradient,
	} from '@wolf-tui/svelte'

	let { onBack }: { onBack: () => void } = $props()

	//#region Menu Data
	const FONTS: readonly BigTextFont[] = [
		'block',
		'slick',
		'tiny',
		'grid',
		'pallet',
		'shade',
		'simple',
		'simpleBlock',
		'3d',
		'simple3d',
		'chrome',
		'huge',
	]

	// Keys 1-9 → fonts 0-8, then 0, -, = → fonts 9-11.
	// WHY: digits only go up to 9, so we need non-digit keys for the last three
	// font slots. The trio 0, -, = sits next to 9 on a standard keyboard row.
	const FONT_KEYS: readonly string[] = [
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'0',
		'-',
		'=',
	]

	type ColorMode = 'solo' | 'gradient' | 'default'
	const COLOR_MODES: readonly ColorMode[] = ['solo', 'gradient', 'default']
	//#endregion Menu Data

	//#region State
	let fontIndex = $state(0)
	let colorModeIndex = $state(0)

	let currentFont = $derived(FONTS[fontIndex] ?? 'block')
	let colorMode = $derived<ColorMode>(COLOR_MODES[colorModeIndex] ?? 'solo')

	// Solo: single cycling color. Gradient: two-stop magenta→cyan sweep.
	// Default: cfonts' own built-in per-font colors.
	let soloColors = $derived<readonly string[] | undefined>(
		colorMode === 'solo' ? ['cyan'] : undefined
	)
	let gradientSpec = $derived<BigTextGradient | undefined>(
		colorMode === 'gradient' ? ['magenta', 'cyan'] : undefined
	)
	//#endregion State

	//#region Input
	useInput((input, key) => {
		if (key.escape) {
			onBack()
			return
		}
		if (input === 'c' || input === 'C') {
			colorModeIndex = (colorModeIndex + 1) % COLOR_MODES.length
			return
		}
		const idx = FONT_KEYS.indexOf(input)
		if (idx !== -1 && idx < FONTS.length) {
			fontIndex = idx
		}
	})
	//#endregion Input
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<Box style={{ flexDirection: 'column', padding: 1 }}>
	<Text style={{ fontWeight: 'bold', color: 'cyan' }}>BigText Demo</Text>
	<Text style={{ dimColor: true }}>
		BigText Demo — 1-9/0/-/= switch font, C cycle color mode, Esc back
	</Text>
	<Box style={{ marginTop: 1, flexDirection: 'column' }}>
		<Text>Font: <Text style={{ color: 'yellow' }}>{currentFont}</Text></Text>
		<Text>Color mode: <Text style={{ color: 'yellow' }}>{colorMode}</Text></Text>
	</Box>
	<Box style={{ marginTop: 1 }}>
		<BigText
			text="WOLF"
			font={currentFont}
			colors={soloColors}
			gradient={gradientSpec}
			space={false}
			align="center"
		/>
	</Box>
</Box>
<!-- #endregion Template -->
