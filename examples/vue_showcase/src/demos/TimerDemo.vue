<script setup lang="ts">
import { ref } from 'vue'
import { Box, Text, useInput, Timer } from '@wolf-tui/vue'

const props = defineProps<{ onBack: () => void }>()

const variant = ref<'timer' | 'countdown' | 'stopwatch'>('timer')

useInput((_input, key) => {
	if (key.escape) props.onBack()
	if (_input === '1') variant.value = 'timer'
	if (_input === '2') variant.value = 'countdown'
	if (_input === '3') variant.value = 'stopwatch'
})
</script>

<script lang="ts">
export default { name: 'TimerDemo' }
</script>

<template>
	<Box :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ fontWeight: 'bold', color: 'cyan' }">Timer Demo</Text>
		<Text :style="{ dimColor: true }">
			1=Timer 2=Countdown 3=Stopwatch | Space=toggle R=reset L=lap | Esc=back
		</Text>
		<Box :style="{ marginTop: 1 }">
			<Timer
				:variant="variant"
				:duration-ms="30000"
				format="human"
				:show-laps="true"
				:on-tick="(_ms: number) => {}"
				:on-complete="() => {}"
			/>
		</Box>
		<Text :style="{ dimColor: true, marginTop: 1 }">Active: {{ variant }}</Text>
	</Box>
</template>
