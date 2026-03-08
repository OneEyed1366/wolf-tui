<script lang="ts">
  import { Box, Text, useInput } from '@wolfie/svelte'

  const items = [
    { id: 'focus-1', label: 'First Item', color: 'red' },
    { id: 'focus-2', label: 'Second Item', color: 'green' },
    { id: 'focus-3', label: 'Third Item', color: 'blue' },
    { id: 'focus-4', label: 'Fourth Item', color: 'yellow' },
  ]

  // $state-based focus — idiomatic Svelte 5 approach for local focus management
  let focusedIndex = $state(0)

  useInput((input, key) => {
    if (key.upArrow) focusedIndex = (focusedIndex - 1 + items.length) % items.length
    if (key.downArrow) focusedIndex = (focusedIndex + 1) % items.length
    if (key.tab && !key.shift) focusedIndex = (focusedIndex + 1) % items.length
    if (key.tab && key.shift) focusedIndex = (focusedIndex - 1 + items.length) % items.length
    const num = parseInt(input)
    if (num >= 1 && num <= items.length) focusedIndex = num - 1
  })

  const focusedItem = $derived(items[focusedIndex])
</script>

<Box className="flex-col w-full">
  <Text className="text-gray">↑↓ or Tab/Shift+Tab navigate · 1-4 direct jump</Text>

  <!-- Focusable items list -->
  <Box className="flex-col mt-1">
    {#each items as item, i}
      {@const focused = i === focusedIndex}
      <Box
        style={{
          borderStyle: focused ? 'double' : 'single',
          borderColor: focused ? item.color : 'gray',
          padding: 1,
          marginBottom: i < items.length - 1 ? 1 : 0,
          flexDirection: 'row',
        }}
      >
        <Text
          style={{
            color: focused ? item.color : 'white',
            fontWeight: focused ? 'bold' : 'normal',
          }}
        >
          {focused ? '▶ ' : '  '}{item.label}{focused ? ' ◀' : ''}
        </Text>
      </Box>
    {/each}
  </Box>

  <!-- Current focus info -->
  <Box className="border-single border-gray p-1 mt-1 flex-col w-full">
    <Text className="font-bold text-cyan">Currently focused:</Text>
    <Text>
      <Text style={{ color: focusedItem.color, fontWeight: 'bold' }}>{focusedItem.label}</Text>
      <Text className="text-gray"> (index {focusedIndex})</Text>
    </Text>
  </Box>

  <!-- useFocus API note -->
  <Box className="border-single border-gray p-1 mt-1 flex-col w-full">
    <Text className="text-gray font-bold">useFocus composable (global manager):</Text>
    <Text className="text-muted">useFocus(&#123; id, autoFocus &#125;) registers with</Text>
    <Text className="text-muted">WolfieSvelte — Tab/Shift+Tab globally advance</Text>
    <Text className="text-muted">the active focus ID across components.</Text>
  </Box>
</Box>
