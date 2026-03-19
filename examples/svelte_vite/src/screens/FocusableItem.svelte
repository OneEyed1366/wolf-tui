<script>
	import { Box, Text, useFocus } from '@wolfie/svelte'

	let { id, label, color, autoFocus = false, isActive = true } = $props()

	const { isFocused } = useFocus({
		id: id,
		autoFocus: autoFocus,
		isActive: () => isActive,
	})
</script>

<Box className={[
	'p-1',
	isFocused() ? 'border-double' : 'border-single',
	isFocused() ? `border-${color}` : 'border-gray',
].join(' ')}>
	<Text className={
		isFocused()
			? `text-${color} font-bold`
			: isActive
				? 'text-white'
				: 'text-gray'
	}>
		{isFocused() ? '> ' : '  '}{label}{isFocused() ? ' (focused)' : ''}{!isActive ? ' (disabled)' : ''}
	</Text>
</Box>
