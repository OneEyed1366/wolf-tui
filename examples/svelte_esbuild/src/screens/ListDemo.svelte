<script>
	import { Box, Text, OrderedList, UnorderedList } from '@wolfie/svelte'
</script>

<Box className="flex-col gap-1 w-full">
	<!-- Ordered List -->
	<Text className="font-bold text-white">Ordered List</Text>
	<OrderedList>
		<Text>Install dependencies with pnpm</Text>
		<Text>Configure your environment</Text>
		<Text>Run the development server</Text>
		<Text>Build for production</Text>
	</OrderedList>

	<!-- Unordered List -->
	<Text className="font-bold text-white mt-1">Unordered List</Text>
	<UnorderedList>
		<Text>Supports Svelte 5 runes</Text>
		<Text>Full TypeScript support</Text>
		<Text>CSS preprocessing (SCSS, LESS, Stylus)</Text>
		<Text>Tailwind CSS integration</Text>
	</UnorderedList>

	<!-- Nested Lists -->
	<Text className="font-bold text-white mt-1">Nested Lists</Text>
	<OrderedList>
		<Text>Frontend</Text>
		<UnorderedList>
			<Text>Svelte components</Text>
			<Text>Composables</Text>
		</UnorderedList>
		<Text>Backend</Text>
		<UnorderedList>
			<Text>API routes</Text>
			<Text>Database models</Text>
		</UnorderedList>
	</OrderedList>
</Box>
