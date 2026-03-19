<script>
	import { Box, Text, ErrorOverview } from '@wolfie/svelte'

	const sampleError = new Error('Failed to fetch user data from API')
	sampleError.stack = `Error: Failed to fetch user data from API
    at fetchUser (src/api/users.ts:42:15)
    at async loadUserProfile (src/components/Profile.svelte:28:20)
    at async init (src/components/Profile.svelte:15:5)
    at mount_component (node_modules/svelte/src/runtime/internal/Component.js:45:12)
    at create_fragment (node_modules/svelte/src/runtime/internal/Component.js:102:29)`
</script>

<Box className="flex-col gap-1 w-full">
	<Text className="font-bold text-white">Error Overview</Text>
	<Text className="text-gray mb-1">
		Displays errors with stack traces for debugging
	</Text>

	<ErrorOverview error={sampleError} />

	<Text className="text-gray mt-1">
		ErrorOverview automatically formats stack traces and highlights relevant
		information for easier debugging.
	</Text>
</Box>
