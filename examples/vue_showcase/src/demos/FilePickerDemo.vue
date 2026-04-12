<script setup lang="ts">
import { ref } from 'vue'
import { Box, Text, useInput, FilePicker } from '@wolf-tui/vue'

const props = defineProps<{ onBack: () => void }>()

const initialPath = process.cwd()
const selectedPaths = ref<string[]>([])
const confirmedPaths = ref<string[]>([])

useInput((_input, key) => {
	if (key.escape && confirmedPaths.value.length === 0) props.onBack()
})
</script>

<script lang="ts">
export default { name: 'FilePickerDemo' }
</script>

<template>
	<Box :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ fontWeight: 'bold', color: 'cyan' }">FilePicker Demo</Text>
		<Text :style="{ dimColor: true }">
			arrow-keys=navigate, Space=toggle, Enter=confirm, left=parent, right=enter
			dir, /=filter, Esc=back
		</Text>
		<Box :style="{ marginTop: 1 }">
			<FilePicker
				:initial-path="initialPath"
				:show-details="true"
				:multi-select="true"
				:max-height="12"
				:on-selection-change="
					(paths: string[]) => {
						selectedPaths = paths
					}
				"
				:on-select="
					(paths: string[]) => {
						confirmedPaths = paths
					}
				"
				:on-directory-change="(_path: string) => {}"
			/>
		</Box>
		<Box
			v-if="selectedPaths.length > 0"
			:style="{ flexDirection: 'column', marginTop: 1 }"
		>
			<Text :style="{ color: 'yellow' }">
				Toggled ({{ selectedPaths.length }}):
			</Text>
			<Text v-for="p in selectedPaths" :key="p" :style="{ dimColor: true }">
				{{ ' ' }}{{ p }}
			</Text>
		</Box>
		<Box
			v-if="confirmedPaths.length > 0"
			:style="{ flexDirection: 'column', marginTop: 1 }"
		>
			<Text :style="{ color: 'green' }">
				Confirmed ({{ confirmedPaths.length }}):
			</Text>
			<Text v-for="p in confirmedPaths" :key="p" :style="{ dimColor: true }">
				{{ ' ' }}{{ p }}
			</Text>
		</Box>
	</Box>
</template>
