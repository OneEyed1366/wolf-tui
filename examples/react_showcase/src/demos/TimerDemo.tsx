import { useState } from 'react'
import { Box, Text, useInput } from '@wolf-tui/react'
import { Timer } from '@wolf-tui/react'

//#region Component
export function TimerDemo({ onBack }: { onBack: () => void }) {
	const [variant, setVariant] = useState<'timer' | 'countdown' | 'stopwatch'>(
		'timer'
	)

	useInput((_input, key) => {
		if (key.escape) onBack()
		if (_input === '1') setVariant('timer')
		if (_input === '2') setVariant('countdown')
		if (_input === '3') setVariant('stopwatch')
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ fontWeight: 'bold', color: 'cyan' }}>Timer Demo</Text>
			<Text style={{ dimColor: true }}>
				1=Timer 2=Countdown 3=Stopwatch | Space=toggle R=reset L=lap | Esc=back
			</Text>
			<Box style={{ marginTop: 1 }}>
				<Timer
					variant={variant}
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
	)
}
//#endregion Component
