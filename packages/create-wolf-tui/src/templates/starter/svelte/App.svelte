<script lang="ts">
	import { Box, Text, useInput, useApp } from '@wolf-tui/svelte'

	let count = $state(0)
	const { exit } = useApp()

	useInput((input, key) => {
		if (key.upArrow) count++
		if (key.downArrow) count--
		if (input === 'q') exit()
	})
</script>

<Box flexDirection="column" padding={1}>
	<Text bold>wolf-tui Counter</Text>
	<Text>Count: {count}</Text>
	<Text dimColor>↑/↓ to change, q to quit</Text>
</Box>
