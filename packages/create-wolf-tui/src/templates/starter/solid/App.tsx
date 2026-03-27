import { createSignal, createMemo } from 'solid-js'
import { Box, Text, useInput, useApp } from '@wolf-tui/solid'

export default function App() {
	const [count, setCount] = createSignal(0)
	const { exit } = useApp()

	const color = createMemo(() =>
		count() > 0 ? 'green' : count() < 0 ? 'red' : 'white'
	)

	useInput((input, key) => {
		if (key.upArrow) setCount((c) => c + 1)
		if (key.downArrow) setCount((c) => c - 1)
		if (input === 'q') exit()
	})

	return (
		<Box
			style={{
				'flex-direction': 'column',
				'border-style': 'round',
				'border-color': 'cyan',
				'padding-left': 2,
				'padding-right': 2,
				'padding-top': 1,
				'padding-bottom': 1,
				gap: 1,
				width: 40,
			}}
		>
			<Box style={{ 'justify-content': 'center' }}>
				<Text style={{ 'font-weight': 'bold', color: 'cyan' }}>wolf-tui</Text>
			</Box>

			<Box
				style={{
					'justify-content': 'center',
					'border-style': 'single',
					'border-color': color(),
					'padding-left': 2,
					'padding-right': 2,
				}}
			>
				<Text style={{ 'font-weight': 'bold', color: color() }}>{count()}</Text>
			</Box>

			<Box style={{ 'justify-content': 'space-around' }}>
				<Text style={{ color: 'green' }}>↑ up</Text>
				<Text style={{ color: 'red' }}>↓ down</Text>
				<Text style={{ color: 'gray' }}>q quit</Text>
			</Box>
		</Box>
	)
}
