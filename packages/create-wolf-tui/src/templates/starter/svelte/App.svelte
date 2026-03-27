<script lang="ts">
	import { Box, Text, useInput, useApp } from '@wolf-tui/svelte'

	let count = $state(0)
	const { exit } = useApp()

	const color = $derived(
		count > 0 ? 'green' : count < 0 ? 'red' : 'white'
	)

	useInput((input, key) => {
		if (key.upArrow) count++
		if (key.downArrow) count--
		if (input === 'q') exit()
	})
</script>

<Box
	style={{
		flexDirection: 'column',
		borderStyle: 'round',
		borderColor: 'cyan',
		paddingLeft: 2,
		paddingRight: 2,
		paddingTop: 1,
		paddingBottom: 1,
		gap: 1,
		width: 40,
	}}
>
	<Box style={{ justifyContent: 'center' }}>
		<Text style={{ fontWeight: 'bold', color: 'cyan' }}>
			wolf-tui
		</Text>
	</Box>

	<Box
		style={{
			justifyContent: 'center',
			borderStyle: 'single',
			borderColor: color,
			paddingLeft: 2,
			paddingRight: 2,
		}}
	>
		<Text style={{ fontWeight: 'bold', color }}>
			{count}
		</Text>
	</Box>

	<Box style={{ justifyContent: 'space-around' }}>
		<Text style={{ color: 'green' }}>↑ up</Text>
		<Text style={{ color: 'red' }}>↓ down</Text>
		<Text style={{ color: 'gray' }}>q quit</Text>
	</Box>
</Box>
