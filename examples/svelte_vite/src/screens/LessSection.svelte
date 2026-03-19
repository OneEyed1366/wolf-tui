<script>
	import { Box, Text } from '@wolfie/svelte'
</script>

<Box className="less-box flex-col mb-1 w-full">
	<Text className="less-text">LESS Flavor</Text>
	<Text className="text-muted"> Nesting from style lang="less" </Text>
</Box>

<style lang="less">
@green: green;

.less-box {
	border-style: single;
	border-color: @green;
	padding: 1;

	.less-text {
		color: @green;
		font-weight: bold;
	}
}

.text-muted {
	color: gray;
}
</style>
