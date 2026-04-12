import { createSignal } from 'solid-js'
import { Box, Text, useInput } from '@wolf-tui/solid'
import { Timer } from '@wolf-tui/solid'

//#region Component
export function TimerDemo(props: { onBack: () => void }) {
	const [variant, setVariant] = createSignal<
		'timer' | 'countdown' | 'stopwatch'
	>('timer')

	useInput((input, key) => {
		if (key.escape) props.onBack()
		if (input === '1') setVariant('timer')
		if (input === '2') setVariant('countdown')
		if (input === '3') setVariant('stopwatch')
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>Timer Demo</Text>
			<Text style={{ dimColor: true }}>
				1=Timer 2=Countdown 3=Stopwatch | Space=toggle R=reset L=lap | Esc=back
			</Text>
			<Box style={{ marginTop: 1 }}>
				<Timer
					variant={variant()}
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
			<Text style={{ dimColor: true, marginTop: 1 }}>Active: {variant()}</Text>
		</Box>
	)
}
//#endregion Component
