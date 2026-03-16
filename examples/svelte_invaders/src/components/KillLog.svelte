<script lang="ts">
	import { Box, Text } from '@wolfie/svelte'
	import type { Kill } from '../composables/useInvaders.svelte'
	import { BRAND } from '../theme'

	//#region Props
	let { kills }: {
		kills: readonly Kill[]
	} = $props()
	//#endregion Props

	//#region Alien Display Config
	const ALIEN_CONFIG = [
		{ name: 'Top', color: 'text-red', points: 30 },
		{ name: 'Mid', color: 'text-yellow', points: 20 },
		{ name: 'Bot', color: 'text-green', points: 10 },
	] as const
	//#endregion Alien Display Config

	//#region Constants
	const MAX_VISIBLE_KILLS = 3
	//#endregion Constants

	//#region Helpers
	function getAlienConfig(type: number) {
		return (
			ALIEN_CONFIG[type] ?? { name: 'Unknown', color: 'text-white', points: 0 }
		)
	}
	//#endregion Helpers

	let visibleKills = $derived(kills.slice(-MAX_VISIBLE_KILLS))
	let emptySlots = $derived(MAX_VISIBLE_KILLS - visibleKills.length)
</script>

<Box style={{ flexDirection: 'column', minWidth: 20 }}>
	<Text style={{ color: BRAND.primary }} className="font-bold">
		⚔ Recent Kills
	</Text>
	{#if visibleKills.length > 0}
		{#each visibleKills as kill (kill.id)}
			<Text className={getAlienConfig(kill.alien.type).color}>
				{getAlienConfig(kill.alien.type).name} +{kill.points}
			</Text>
		{/each}
		{#if emptySlots > 0}
			{#each Array.from({ length: emptySlots }) as _}
				<Text> </Text>
			{/each}
		{/if}
	{:else}
		<Text style={{ color: BRAND.textMuted }} className="italic">
			Start shooting!
		</Text>
	{/if}
</Box>
