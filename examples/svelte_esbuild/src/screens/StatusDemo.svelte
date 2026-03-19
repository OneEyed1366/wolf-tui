<script>
	import { Box, Text, Alert, Badge, StatusMessage, Spinner, ProgressBar } from '@wolfie/svelte'
</script>

<Box className="flex-col gap-1 w-full">
	<!-- Alerts -->
	<Text className="font-bold text-white">Alerts</Text>
	<Alert variant="success" message="Operation completed successfully!" />
	<Alert variant="warning" message="Check your settings before proceeding" />
	<Alert variant="error" message="Something went wrong" />

	<!-- Badges -->
	<Text className="font-bold text-white mt-1">Badges</Text>
	<Box className="flex-row gap-2">
		<Badge color="green" label="Active" />
		<Badge color="yellow" label="Pending" />
		<Badge color="red" label="Failed" />
		<Badge color="blue" label="Info" />
	</Box>

	<!-- Status Messages -->
	<Text className="font-bold text-white mt-1">Status Messages</Text>
	<StatusMessage variant="success" message="Build succeeded" />
	<StatusMessage variant="error" message="Tests failed (3 errors)" />
	<StatusMessage variant="warning" message="Dependencies outdated" />
	<StatusMessage variant="info" message="Compiling..." />

	<!-- Spinner -->
	<Text className="font-bold text-white mt-1">Spinner</Text>
	<Box className="flex-row gap-1">
		<Spinner />
		<Text className="text-gray">Loading resources...</Text>
	</Box>

	<!-- Progress Bar -->
	<Text className="font-bold text-white mt-1">Progress Bar</Text>
	<Box className="flex-col w-[40]">
		<ProgressBar value={75} />
		<Text className="text-gray">75% complete</Text>
	</Box>
</Box>
