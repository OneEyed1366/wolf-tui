<!-- #region Script -->
<script lang="ts">
	import { Box, Text, useInput, Timer } from '@wolf-tui/svelte'

	let { onBack }: { onBack: () => void } = $props()

	let variant = $state<'timer' | 'countdown' | 'stopwatch'>('timer')

	useInput((_input, key) => {
		if (key.escape) onBack()
		if (_input === '1') variant = 'timer'
		if (_input === '2') variant = 'countdown'
		if (_input === '3') variant = 'stopwatch'
	})
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<Box style={{ flexDirection: 'column', padding: 1 }}>
	<Text style={{ fontWeight: 'bold', color: 'cyan' }}>Timer Demo</Text>
	<Text style={{ dimColor: true }}>
		1=Timer 2=Countdown 3=Stopwatch | Space=toggle R=reset L=lap | Esc=back
	</Text>
	<Box style={{ marginTop: 1 }}>
		<Timer
			{variant}
			durationMs={30000}
			format="human"
			showLaps
			onTick={(_ms) => {
				// visible in WOLFIE_LOG
			}}
			onComplete={() => {
				// countdown done
			}}
		/>
	</Box>
	<Text style={{ dimColor: true, marginTop: 1 }}>Active: {variant}</Text>
</Box>
<!-- #endregion Template -->
