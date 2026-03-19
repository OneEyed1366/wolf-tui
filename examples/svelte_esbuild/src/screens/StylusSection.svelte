<script>
	import { Box, Text } from '@wolfie/svelte'
</script>

<Box className="stylus-box flex-col mb-1 w-full">
	<Text className="stylus-text">Stylus Flavor</Text>
	<Text className="text-muted">Indentation-based style lang="stylus"</Text>
</Box>

<style lang="stylus">
$yellow = yellow

.stylus-box
	border-style single
	border-color $yellow
	padding 1

	.stylus-text
		color $yellow
		font-style italic

.text-muted
	color gray
</style>
