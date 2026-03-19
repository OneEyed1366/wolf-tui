<script>
	import { Box, Text, TextInput, PasswordInput, EmailInput, ConfirmInput } from '@wolfie/svelte'

	const nameSuggestions = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward']

	let name = $state('')
	let password = $state('')
	let email = $state('')
	let confirmStatus = $state('pending')
</script>

<Box className="flex-col gap-1 w-full">
	<Text className="font-bold text-white">Text Inputs</Text>

	<!-- Text Input -->
	<Box className="flex-row">
		<Text className="w-[12]">Name: </Text>
		<TextInput
			placeholder="Enter your name..."
			suggestions={nameSuggestions}
			onChange={(v) => (name = v)}
			onSubmit={(v) => (name = v)}
		/>
	</Box>

	<!-- Password Input -->
	<Box className="flex-row">
		<Text className="w-[12]">Password: </Text>
		<PasswordInput onChange={(v) => (password = v)} />
	</Box>

	<!-- Email Input -->
	<Box className="flex-row">
		<Text className="w-[12]">Email: </Text>
		<EmailInput onChange={(v) => (email = v)} />
	</Box>

	<!-- Confirm Input -->
	<Box className="flex-row">
		<Text className="w-[12]">Confirm? </Text>
		<ConfirmInput
			onConfirm={() => (confirmStatus = 'confirmed')}
			onCancel={() => (confirmStatus = 'cancelled')}
		/>
	</Box>

	<!-- Current Values -->
	<Box className="border-single border-gray p-1 mt-1 flex-col">
		<Text className="font-bold text-cyan">Current Values:</Text>
		<Text>Name: {name || '(empty)'}</Text>
		<Text>Password: {password ? '*'.repeat(password.length) : '(empty)'}</Text>
		<Text>Email: {email || '(empty)'}</Text>
		<Text>Confirmed: {confirmStatus}</Text>
	</Box>

	<Text className="text-gray">
		Type to enter values. Tab autocompletes suggestions.
	</Text>
</Box>
