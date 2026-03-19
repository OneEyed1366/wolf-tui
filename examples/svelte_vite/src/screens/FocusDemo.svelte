<script>
	import { Box, Text, useInput, useFocusManager } from '@wolfie/svelte'
	import FocusableItem from './FocusableItem.svelte'

	const items = [
		{ id: 'item-1', label: 'First Item', color: 'red' },
		{ id: 'item-2', label: 'Second Item', color: 'green' },
		{ id: 'item-3', label: 'Third Item', color: 'blue' },
		{ id: 'item-4', label: 'Fourth Item', color: 'yellow' },
	]

	let item2Active = $state(true)
	const { focus } = useFocusManager()

	useInput((input) => {
		const num = parseInt(input)
		if (num >= 1 && num <= 4) {
			focus(`item-${num}`)
		}
		if (input === 'd') {
			item2Active = !item2Active
		}
	})
</script>

<Box className="flex-col gap-1 w-full">
	<Text className="text-gray">Tab/Shift+Tab to navigate between items</Text>

	<!-- Focusable Items -->
	<Box className="flex-col gap-1">
		{#each items as item, i}
			<FocusableItem
				id={item.id}
				label={item.label}
				color={item.color}
				autoFocus={i === 0}
				isActive={item.id === 'item-2' ? item2Active : true}
			/>
		{/each}
	</Box>

	<!-- Focus Controls -->
	<Box className="border-single border-gray p-1 mt-1 flex-col">
		<Text className="font-bold text-cyan">Focus Controls:</Text>
		<Text className="text-gray">Press 1-4 to focus item directly</Text>
		<Text className="text-gray">Press 'd' to disable/enable item 2</Text>
		<Text className="text-gray mt-1">Item 2 active: {item2Active ? 'Yes' : 'No'}</Text>
	</Box>
</Box>
