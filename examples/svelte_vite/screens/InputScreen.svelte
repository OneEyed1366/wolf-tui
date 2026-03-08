<script lang="ts">
  import { Box, Text, useInput } from '@wolfie/svelte'

  let typed = $state('')
  let lastKey = $state('(none)')
  let modifiers = $state({ ctrl: false, shift: false, meta: false, alt: false })

  useInput((input, key) => {
    // Track modifiers
    modifiers = {
      ctrl: key.ctrl,
      shift: key.shift,
      meta: key.meta,
      alt: !!key.meta, // meta doubles as alt on many terminals
    }

    // Build typed string
    if (key.backspace || key.delete) {
      typed = typed.slice(0, -1)
      lastKey = 'backspace'
      return
    }
    if (key.return) {
      typed = ''
      lastKey = 'enter (cleared)'
      return
    }
    if (key.escape) {
      typed = ''
      lastKey = 'escape (cleared)'
      return
    }

    // Named keys
    if (key.upArrow) { lastKey = '↑ upArrow'; return }
    if (key.downArrow) { lastKey = '↓ downArrow'; return }
    if (key.leftArrow) { lastKey = '← leftArrow'; return }
    if (key.rightArrow) { lastKey = '→ rightArrow'; return }
    if (key.tab) { lastKey = key.shift ? 'shift+tab' : 'tab'; return }
    if (key.pageUp) { lastKey = 'pageUp'; return }
    if (key.pageDown) { lastKey = 'pageDown'; return }

    // Regular character
    if (input && input.length === 1 && input >= ' ') {
      typed += input
      const mod = [key.ctrl && 'ctrl', key.shift && 'shift', key.meta && 'meta']
        .filter(Boolean).join('+')
      lastKey = mod ? `${mod}+${input}` : `'${input}'`
    }
  })

  const charCount = $derived(typed.length)
</script>

<Box className="flex-col w-full">
  <!-- Typed text buffer -->
  <Box className="border-single border-blue p-1 mb-1 flex-col w-full">
    <Text className="font-bold text-blue">Type anything:</Text>
    <Box className="border-single border-gray p-1 mt-1">
      {#if typed.length > 0}
        <Text className="text-white">{typed}</Text>
      {:else}
        <Text className="text-muted">(start typing...)</Text>
      {/if}
    </Box>
    <Text className="text-gray">{charCount} chars · Enter/Esc = clear · Backspace = delete</Text>
  </Box>

  <!-- Last key info -->
  <Box className="border-single border-cyan p-1 mb-1 flex-col w-full">
    <Text className="font-bold text-cyan">Last key pressed:</Text>
    <Text className="text-yellow">{lastKey}</Text>
  </Box>

  <!-- Active modifiers -->
  <Box className="border-single border-yellow p-1 mb-1 flex-row gap-2">
    <Text className="font-bold text-yellow">Modifiers:</Text>
    <Text style={{ color: modifiers.ctrl ? 'green' : 'gray' }}>ctrl</Text>
    <Text style={{ color: modifiers.shift ? 'green' : 'gray' }}>shift</Text>
    <Text style={{ color: modifiers.meta ? 'green' : 'gray' }}>meta</Text>
  </Box>

  <!-- Key reference -->
  <Box className="border-single border-gray p-1 flex-col w-full">
    <Text className="text-gray font-bold">Special keys:</Text>
    <Text className="text-gray">↑↓←→ arrows · Tab · Shift+Tab · Backspace · Enter · Esc</Text>
    <Text className="text-gray">Ctrl+key combos · Meta (Alt) combos</Text>
  </Box>
</Box>
