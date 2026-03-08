<script lang="ts">
  import { onDestroy } from 'svelte'
  import { Box, Text } from '@wolfie/svelte'

  // $state — reactive variable (Svelte 5 rune)
  let count = $state(0)
  let items = $state(['wolf-tui', 'Svelte 5', 'Taffy layout'])

  // $derived — computed from $state
  const doubled = $derived(count * 2)
  const isEven = $derived(count % 2 === 0)
  const itemCount = $derived(items.length)

  // $effect — runs when dependencies change
  let lastChange = $state('(none)')
  $effect(() => {
    // WHY: $effect tracks count reactively; updates lastChange whenever count changes
    lastChange = `count changed to ${count}`
  })

  // Timer with onDestroy cleanup (reliable alternative to $effect for intervals)
  let timer = $state(0)
  const interval = setInterval(() => { timer++ }, 1000)
  onDestroy(() => clearInterval(interval))

  function addItem() {
    items = [...items, `item-${items.length + 1}`]
  }

  function removeItem() {
    if (items.length > 1) items = items.slice(0, -1)
  }
</script>

<Box className="flex-col w-full">
  <!-- $state and $derived -->
  <Box className="border-single border-blue p-1 mb-1 flex-col w-full">
    <Text className="font-bold text-blue">$state + $derived</Text>
    <Text>count = {count} · doubled = {doubled}</Text>
    <Text style={{ color: isEven ? 'green' : 'yellow' }}>
      {isEven ? 'even' : 'odd'} (↑/↓ keys on Input screen to test)
    </Text>
  </Box>

  <!-- $effect -->
  <Box className="border-single border-cyan p-1 mb-1 flex-col w-full">
    <Text className="font-bold text-cyan">$effect</Text>
    <Text className="text-muted">Last: {lastChange}</Text>
  </Box>

  <!-- Timer with onDestroy -->
  <Box className="border-single border-yellow p-1 mb-1 flex-row">
    <Text className="font-bold text-yellow">Timer: </Text>
    <Text>{timer}s</Text>
  </Box>

  <!-- conditional rendering -->
  <Box className="border-single border-green p-1 mb-1 flex-col w-full">
    <Text className="font-bold text-green">conditional rendering</Text>
    {#if count > 5}
      <Text className="text-green">count &gt; 5 — condition true!</Text>
    {:else if count > 0}
      <Text className="text-yellow">0 &lt; count ≤ 5</Text>
    {:else}
      <Text className="text-muted">count = 0 (initial state)</Text>
    {/if}
  </Box>

  <!-- list rendering -->
  <Box className="border-single border-magenta p-1 flex-col w-full">
    <Text className="font-bold text-magenta">list rendering ({itemCount} items)</Text>
    {#each items as item, i}
      <Text style={{ color: i % 2 === 0 ? 'white' : 'gray' }}>
        {i + 1}. {item}
      </Text>
    {/each}
    <Box className="flex-row gap-2 mt-1">
      <Text className="text-cyan">+ add / - remove items (see Input screen)</Text>
    </Box>
  </Box>
</Box>
