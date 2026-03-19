<script>
	import { Box, Text } from '@wolfie/svelte'
</script>

<Box className="card flex-col mb-1 w-full">
	<Text className="card-title">SCSS Flavor</Text>
	<Text className="text-muted"> Nested selectors from style lang="scss" </Text>
</Box>

<Box className="flex-row gap-2">
	<Box className="btn primary">
		<Text>SCSS Btn</Text>
	</Box>
</Box>

<style lang="scss">
$primary: magenta;

.card {
	border-style: single;
	padding: 1;
	border-color: $primary;

	.card-title {
		color: $primary;
		font-weight: bold;
	}
}

.text-muted {
	color: gray;
}

.btn {
	padding-x: 2;
	padding-y: 1;
	border-style: single;
	border-color: $primary;

	&.primary {
		border-color: $primary;
	}
}
</style>
