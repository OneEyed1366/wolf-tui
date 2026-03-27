import { createSignal } from 'solid-js'
import { Box, Text, useInput, useApp } from '@wolf-tui/solid'

export default function App() {
	const [count, setCount] = createSignal(0)
	const { exit } = useApp()

	useInput((input, key) => {
		if (key.upArrow) setCount((c) => c + 1)
		if (key.downArrow) setCount((c) => c - 1)
		if (input === 'q') exit()
	})

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold>wolf-tui Counter</Text>
			<Text>Count: {count()}</Text>
			<Text dimColor>↑/↓ to change, q to quit</Text>
		</Box>
	)
}
