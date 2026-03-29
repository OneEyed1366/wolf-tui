<template>
	<Box class="flex-col gap-1 w-full">
		<!-- Alerts -->
		<Text class="font-bold text-white">Alerts</Text>
		<Alert variant="success">Operation completed successfully!</Alert>
		<Alert variant="warning">Check your settings before proceeding</Alert>
		<Alert variant="error">Something went wrong</Alert>

		<!-- Badges -->
		<Text class="font-bold text-white mt-1">Badges</Text>
		<Box class="flex-row gap-2">
			<Badge color="green">Active</Badge>
			<Badge color="yellow">Pending</Badge>
			<Badge color="red">Failed</Badge>
			<Badge color="blue">Info</Badge>
		</Box>

		<!-- Status Messages -->
		<Text class="font-bold text-white mt-1">Status Messages</Text>
		<StatusMessage variant="success">Build succeeded</StatusMessage>
		<StatusMessage variant="error">Tests failed (3 errors)</StatusMessage>
		<StatusMessage variant="warning">Dependencies outdated</StatusMessage>
		<StatusMessage variant="info">Compiling...</StatusMessage>

		<!-- Spinner -->
		<Text class="font-bold text-white mt-1">Spinner</Text>
		<Box class="flex-row gap-1">
			<Spinner />
			<Text class="text-gray">Loading resources...</Text>
		</Box>

		<!-- Progress Bar -->
		<Text class="font-bold text-white mt-1">Progress Bar</Text>
		<Box class="flex-col w-[40]">
			<ProgressBar :value="75" />
			<Text class="text-gray">75% complete</Text>
		</Box>
	</Box>
</template>

<script setup lang="ts">
import {
	Box,
	Text,
	Alert,
	Badge,
	StatusMessage,
	Spinner,
	ProgressBar,
} from '@wolf-tui/vue'
</script>
