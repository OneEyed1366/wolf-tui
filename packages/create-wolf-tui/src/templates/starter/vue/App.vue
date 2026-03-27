<template>
	<Box flexDirection="column" :padding="1">
		<Text :bold="true">wolf-tui Counter</Text>
		<Text>Count: {{ count }}</Text>
		<Text :dimColor="true">↑/↓ to change, q to quit</Text>
	</Box>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Box, Text, useInput, useApp } from '@wolf-tui/vue'

const count = ref(0)
const { exit } = useApp()

useInput((input, key) => {
	if (key.upArrow) count.value++
	if (key.downArrow) count.value--
	if (input === 'q') exit()
})
</script>
