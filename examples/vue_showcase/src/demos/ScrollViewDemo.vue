<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box, Text, useInput, ScrollView } from '@wolf-tui/vue'

const props = defineProps<{ onBack: () => void }>()

useInput((_input, key) => {
	if (key.escape) props.onBack()
})

//#region State
const offset = ref(0)
const contentHeight = ref(0)

const VIEWPORT_HEIGHT = 8
const TOTAL_ITEMS = 30

const items = computed(() =>
	Array.from(
		{ length: TOTAL_ITEMS },
		(_, i) => `Item ${String(i + 1).padStart(2, '0')}`
	)
)

function handleScroll(value: number) {
	offset.value = value
}

function handleContentHeightChange(height: number) {
	contentHeight.value = height
}
//#endregion State
</script>

<script lang="ts">
export default { name: 'ScrollViewDemo' }
</script>

<template>
	<Box :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ fontWeight: 'bold', color: 'cyan' }">ScrollView Demo</Text>
		<Text :style="{ dimColor: true }">
			↑↓=scroll PgUp/PgDn=page Home/End=edges Esc=back
		</Text>
		<Box :style="{ marginTop: 1, borderStyle: 'round', borderColor: 'gray' }">
			<ScrollView
				:height="VIEWPORT_HEIGHT"
				:offset="offset"
				:on-scroll="handleScroll"
				:on-content-height-change="handleContentHeightChange"
			>
				<Text v-for="item in items" :key="item">{{ item }}</Text>
			</ScrollView>
		</Box>
		<Text :style="{ dimColor: true, marginTop: 1 }">
			offset={{ offset }} contentHeight={{ contentHeight }} viewport={{
				VIEWPORT_HEIGHT
			}}
		</Text>
	</Box>
</template>
