<script lang="ts">
	import { Box, Text, Newline, useInput } from '@wolfie/svelte'
	import type { Screen } from '../composables/useInvaders.svelte'
	import { BRAND } from '../theme'

	//#region Props
	let { onNavigate }: {
		onNavigate: (screen: Screen) => void
	} = $props()
	//#endregion Props

	useInput((input, key) => {
		if (key.escape || input === 'q') {
			onNavigate('menu')
		}
	})
</script>

<Box
	style={{
		width: '100vw',
		height: '100vh',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: BRAND.bgDark,
		padding: 2,
	}}
>
	<Text style={{ color: BRAND.primary }} className="font-bold text-lg">
		📖 HELP
	</Text>
	<Newline />

	<Box style={{ flexDirection: 'row', gap: 4 }}>
		<!-- Controls Column -->
		<Box style={{ flexDirection: 'column' }}>
			<Text className="text-yellow font-bold">Controls</Text>
			<Text>
				<Text className="text-cyan">• ←/→</Text> Move ship
			</Text>
			<Text>
				<Text className="text-cyan">• Space</Text> Fire
			</Text>
			<Text>
				<Text className="text-cyan">• P</Text> Pause
			</Text>
			<Text>
				<Text className="text-cyan">• Q/Esc</Text> Quit
			</Text>
		</Box>

		<!-- Scoring Column -->
		<Box style={{ flexDirection: 'column' }}>
			<Text className="text-yellow font-bold">Scoring</Text>
			<Text>
				<Text className="text-red">• ^</Text> Top alien = 30 pts
			</Text>
			<Text>
				<Text className="text-yellow">• N</Text> Mid alien = 20 pts
			</Text>
			<Text>
				<Text className="text-green">• Y</Text> Bot alien = 10 pts
			</Text>
			<Text>• Wave clear = +100 pts</Text>
		</Box>
	</Box>

	<Newline />
	<Box style={{ flexDirection: 'column', alignItems: 'center' }}>
		<Text className="text-yellow font-bold">Tips</Text>
		<Text className="text-gray">
			• Destroy aliens before they reach bottom
		</Text>
		<Text className="text-gray">• Shields absorb bullets but degrade</Text>
		<Text className="text-gray">• Aliens speed up as you kill them</Text>
	</Box>

	<Newline />
	<Text className="text-gray">Esc Return to menu</Text>
</Box>
