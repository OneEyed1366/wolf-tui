<script setup lang="ts">
import { ref } from 'vue'
import { Box, Text, useInput, Combobox } from '@wolf-tui/vue'

const props = defineProps<{ onBack: () => void }>()

const selected = ref<string | undefined>(undefined)
const lastEscapeMs = ref(0)

useInput((_input, key) => {
	if (key.escape) {
		const now = Date.now()
		if (now - lastEscapeMs.value < 500) {
			props.onBack()
		}
		lastEscapeMs.value = now
	}
})

//#region Data
const languages = [
	{ label: 'TypeScript', value: 'ts' },
	{ label: 'JavaScript', value: 'js' },
	{ label: 'Python', value: 'py' },
	{ label: 'Rust', value: 'rs' },
	{ label: 'Go', value: 'go' },
	{ label: 'Ruby', value: 'rb' },
	{ label: 'Java', value: 'java' },
	{ label: 'C++', value: 'cpp' },
	{ label: 'C#', value: 'cs' },
	{ label: 'Kotlin', value: 'kt' },
	{ label: 'Swift', value: 'swift' },
	{ label: 'PHP', value: 'php' },
	{ label: 'Elixir', value: 'ex' },
	{ label: 'Haskell', value: 'hs' },
	{ label: 'Scala', value: 'scala' },
]
//#endregion Data
</script>

<script lang="ts">
export default { name: 'ComboboxDemo' }
</script>

<template>
	<Box :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ fontWeight: 'bold', color: 'cyan' }">Combobox Demo</Text>
		<Text :style="{ dimColor: true }">
			Type to filter, arrow-keys=navigate, Enter=select, Tab=autofill,
			Esc×2=back
		</Text>
		<Box :style="{ marginTop: 1 }">
			<Combobox
				:options="languages"
				placeholder="Search languages..."
				:visible-option-count="8"
				:on-select="
					(value: string) => {
						selected = value
					}
				"
			/>
		</Box>
		<Text v-if="selected" :style="{ color: 'green', marginTop: 1 }">
			Selected: {{ selected }}
		</Text>
	</Box>
</template>
