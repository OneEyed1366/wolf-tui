<script>
	import { Box, Text, Select, MultiSelect } from '@wolfie/svelte'

	const colorOptions = [
		{ label: 'Red', value: 'red' },
		{ label: 'Green', value: 'green' },
		{ label: 'Blue', value: 'blue' },
		{ label: 'Yellow', value: 'yellow' },
		{ label: 'Purple', value: 'purple' },
	]

	const featureOptions = [
		{ label: 'TypeScript Support', value: 'typescript' },
		{ label: 'Hot Reload', value: 'hot-reload' },
		{ label: 'CSS Modules', value: 'css-modules' },
		{ label: 'Tailwind CSS', value: 'tailwind' },
		{ label: 'SSR Support', value: 'ssr' },
	]

	let selectedColor = $state('')
	let selectedFeatures = $state([])
	let focusedList = $state('color')

	function onColorChange(v) {
		selectedColor = v
		focusedList = 'features'
	}
</script>

<Box className="flex-col gap-1 w-full">
	<!-- Single Select -->
	<Text className={focusedList === 'color' ? 'font-bold text-cyan' : 'font-bold text-white'}>
		Single Select {focusedList === 'color' ? '(active)' : ''}
	</Text>
	<Text className="text-gray">Arrows navigate, Enter selects (auto-advances to next)</Text>
	<Select
		options={colorOptions}
		visibleOptionCount={4}
		isDisabled={focusedList !== 'color'}
		onChange={onColorChange}
	/>

	<!-- Multi Select -->
	<Text className={focusedList === 'features' ? 'font-bold text-cyan' : 'font-bold text-white'}
		class="mt-1">
		Multi Select {focusedList === 'features' ? '(active)' : ''}
	</Text>
	<Text className="text-gray">Space toggles, Enter confirms</Text>
	<MultiSelect
		options={featureOptions}
		visibleOptionCount={4}
		isDisabled={focusedList !== 'features'}
		onChange={(v) => (selectedFeatures = v)}
	/>

	<!-- Selected Values -->
	<Box className="border-single border-gray p-1 mt-1 flex-col">
		<Text className="font-bold text-cyan">Selected Values:</Text>
		<Text>Color: {selectedColor || '(none)'}</Text>
		<Text>Features: {selectedFeatures.length > 0 ? selectedFeatures.join(', ') : '(none)'}</Text>
	</Box>
</Box>
