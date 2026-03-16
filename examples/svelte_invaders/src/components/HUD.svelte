<script lang="ts">
	import { Box, Text, Spacer, Badge } from '@wolfie/svelte'
	import { BRAND } from '../theme'

	//#region Props
	let { score, lives, wave, showFps, fps }: {
		score: number
		lives: number
		wave: number
		showFps?: boolean
		fps?: number
	} = $props()
	//#endregion Props

	let formattedScore = $derived(score.toString().padStart(6, '0'))
	let livesHearts = $derived(
		Array.from({ length: lives }, () => '♥').join(' ')
	)
</script>

<Box style={{ flexDirection: 'row', width: '100%' }}>
	<Box>
		<Text style={{ color: BRAND.primary }} className="font-bold">
			SCORE{' '}
		</Text>
		<Text
			style={{ color: BRAND.bgDark, backgroundColor: BRAND.primary }}
			className="font-bold"
		>
			{' ' + formattedScore + ' '}
		</Text>
	</Box>

	<Spacer />

	<Box>
		<Text style={{ color: BRAND.error }} className="font-bold">
			LIVES{' '}
		</Text>
		<Text style={{ color: BRAND.error }}>{livesHearts}</Text>
	</Box>

	<Spacer />

	<Box>
		<Text style={{ color: BRAND.primary }} className="font-bold">
			WAVE{' '}
		</Text>
		<Badge color={BRAND.primaryDark}>{wave.toString()}</Badge>
	</Box>

	{#if showFps}
		<Spacer />
		<Box>
			<Text style={{ color: BRAND.textMuted }}>FPS </Text>
			<Text style={{ color: BRAND.success }}>{fps ?? 0}</Text>
		</Box>
	{/if}
</Box>
