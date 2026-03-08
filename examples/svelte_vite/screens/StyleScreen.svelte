<script lang="ts">
  import { Box, Text } from '@wolfie/svelte'
  import buttonStyles from '../styles/Button.module.css'
  import cardStyles from '../styles/Card.module.css'
</script>

<Box className="flex-col w-full">
  <!-- Wolfie CSS utilities via className prop -->
  <Box className="border-double border-yellow p-1 mb-1 flex-col w-full">
    <Text className="text-[cyan]">Wolfie Classes: border-double + text-[cyan]</Text>
    <Text className="text-muted">className prop with tailwind-style utilities</Text>
  </Box>

  <!-- Inline style object (IStyles) -->
  <Box style={{ borderStyle: 'single', borderColor: 'green', padding: 1, marginBottom: 1, flexDirection: 'column' }}>
    <Text style={{ color: 'green', fontWeight: 'bold' }}>Inline style={{ }} object</Text>
    <Text className="text-muted">Passed directly as wolfie IStyles</Text>
  </Box>

  <!-- CSS Modules -->
  <Box className={[cardStyles.card, 'flex-col mb-1 w-full'].join(' ')}>
    <Text className={cardStyles.cardTitle}>CSS Modules Flavor</Text>
    <Text className="text-muted">Scoped styles from Card.module.css</Text>
  </Box>

  <!-- Global CSS classes -->
  <Box className="border-single border-gray p-1 mb-1 flex-col w-full">
    <Text className="text-base font-bold">Global CSS Classes</Text>
    <Text className="text-muted">From styles/global.css via registerStyles()</Text>
  </Box>

  <!-- Buttons mix -->
  <Box className="flex-row gap-2 w-full">
    <Box className="bg-blue-600 p-x-2">
      <Text className="text-white">Tailwind Btn</Text>
    </Box>
    <Box className={buttonStyles.button}>
      <Text className={buttonStyles.text}>Module Btn</Text>
    </Box>
    <Box style={{ borderStyle: 'single', borderColor: 'magenta', paddingLeft: 2, paddingRight: 2 }}>
      <Text style={{ color: 'magenta' }}>Inline Btn</Text>
    </Box>
  </Box>
</Box>
