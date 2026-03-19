<script>
	import { Box, Text, useInput, useApp } from '@wolfie/svelte'
	import StyleDemo from './screens/StyleDemo.svelte'
	import InputDemo from './screens/InputDemo.svelte'
	import SelectDemo from './screens/SelectDemo.svelte'
	import StatusDemo from './screens/StatusDemo.svelte'
	import ListDemo from './screens/ListDemo.svelte'
	import ErrorDemo from './screens/ErrorDemo.svelte'
	import FocusDemo from './screens/FocusDemo.svelte'

	const screens = [
		{ name: 'Styles', component: StyleDemo },
		{ name: 'Inputs', component: InputDemo },
		{ name: 'Select', component: SelectDemo },
		{ name: 'Status', component: StatusDemo },
		{ name: 'Lists', component: ListDemo },
		{ name: 'Errors', component: ErrorDemo },
		{ name: 'Focus', component: FocusDemo },
	]

	let activeScreen = $state(0)
	const { exit } = useApp()

	useInput((input, key) => {
		if (input === 'q') exit()
		const isFocusScreen = screens[activeScreen].name === 'Focus'
		if (!isFocusScreen) {
			if (key.tab && !key.shift) {
				activeScreen = (activeScreen + 1) % screens.length
			}
			if (key.tab && key.shift) {
				activeScreen = (activeScreen - 1 + screens.length) % screens.length
			}
		}
		const num = parseInt(input)
		if (num >= 1 && num <= screens.length) {
			activeScreen = num - 1
		}
	})
</script>

<Box className="flex-col p-1 w-full">
	<!-- Header -->
	<Box className="mb-1">
		<Text className="text-blue font-bold"> Wolfie Svelte Comprehensive Demo </Text>
	</Box>

	<!-- Screen tabs -->
	<Box className="flex-row gap-2 mb-1">
		{#each screens as screen, i}
			<Text className={i === activeScreen ? 'text-cyan font-bold' : 'text-gray'}>
				[{i + 1}] {screen.name}
			</Text>
		{/each}
	</Box>

	<!-- Active screen -->
	{@const ActiveScreen = screens[activeScreen].component}
	<ActiveScreen />

	<!-- Footer -->
	<Box className="mt-1 border-t-single border-gray p-t-1">
		<Text className="text-gray">
			{screens[activeScreen].name === 'Focus' ? 'tab focus' : 'tab navigate'}
			| 1-7 jump | q quit
		</Text>
	</Box>
</Box>
