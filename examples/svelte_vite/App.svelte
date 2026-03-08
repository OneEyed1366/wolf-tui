<script lang="ts">
  import { Box, Text, useInput, useApp } from '@wolfie/svelte'
  import StyleScreen from './screens/StyleScreen.svelte'
  import ReactivityScreen from './screens/ReactivityScreen.svelte'
  import InputScreen from './screens/InputScreen.svelte'
  import FocusScreen from './screens/FocusScreen.svelte'

  const { exit } = useApp()

  const screens = [
    { name: 'Styles', component: StyleScreen },
    { name: 'Runes', component: ReactivityScreen },
    { name: 'Input', component: InputScreen },
    { name: 'Focus', component: FocusScreen },
  ]

  let activeScreen = $state(0)
  const currentScreen = $derived(screens[activeScreen])
  // WHY: Svelte 5 runes mode — dynamic component via $derived variable, not svelte:component
  const CurrentComponent = $derived(currentScreen.component)
  const isFocusScreen = $derived(currentScreen.name === 'Focus')

  useInput((input, key) => {
    if (input === 'q') exit()
    // Let Focus screen capture Tab for its own navigation
    if (!isFocusScreen) {
      if (key.tab && !key.shift) activeScreen = (activeScreen + 1) % screens.length
      if (key.tab && key.shift) activeScreen = (activeScreen - 1 + screens.length) % screens.length
    }
    const num = parseInt(input)
    if (num >= 1 && num <= screens.length) activeScreen = num - 1
  })
</script>

<Box className="flex-col p-1 w-full">
  <!-- Header -->
  <Box className="mb-1">
    <Text style={{ color: 'blue', fontWeight: 'bold' }}>Wolfie Svelte Comprehensive Demo</Text>
  </Box>

  <!-- Screen tabs -->
  <Box className="flex-row gap-2 mb-1">
    {#each screens as screen, i}
      <Text style={{
        color: i === activeScreen ? 'cyan' : 'gray',
        fontWeight: i === activeScreen ? 'bold' : 'normal',
      }}>
        [{i + 1}] {screen.name}
      </Text>
    {/each}
  </Box>

  <!-- Active screen — dynamic component (Svelte 5 runes: variable component) -->
  <CurrentComponent />

  <!-- Footer -->
  <Box className="mt-1 border-t-single border-gray p-t-1">
    <Text className="text-gray">
      {isFocusScreen ? 'arrows/tab navigate' : 'tab navigate'} | 1-4 jump | q quit
    </Text>
  </Box>
</Box>
