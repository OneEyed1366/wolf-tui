<script lang="ts">
	import { useInvaders } from './composables/useInvaders.svelte'
	import { useTerminalSize } from './composables/useTerminalSize.svelte'

	//#region Screens
	import Menu from './screens/Menu.svelte'
	import Game from './screens/Game.svelte'
	import GameOver from './screens/GameOver.svelte'
	import HighScores from './screens/HighScores.svelte'
	import Settings from './screens/Settings.svelte'
	import Help from './screens/Help.svelte'
	//#endregion Screens

	//#region Component
	const term = useTerminalSize()
	// Keep invaders as a single object — do NOT destructure `state`.
	// Destructuring would snapshot the getter value; accessing .state
	// reactively ensures Svelte tracks changes to the $state inside.
	const invaders = useInvaders(
		() => term.width,
		() => term.height
	)
	//#endregion Component
</script>

{#if invaders.state.screen === 'menu'}
	<Menu onNavigate={invaders.navigate} onStartGame={invaders.startGame} />
{:else if invaders.state.screen === 'game'}
	<Game
		gameState={invaders.state}
		onTick={invaders.tick}
		onMovePlayer={invaders.movePlayer}
		onShoot={invaders.shoot}
		onAlienShoot={invaders.alienShoot}
		onPause={invaders.pause}
		onNextWave={invaders.nextWave}
		onNavigate={invaders.navigate}
	/>
{:else if invaders.state.screen === 'gameover'}
	<GameOver
		score={invaders.state.score}
		wave={invaders.state.wave}
		onNavigate={invaders.navigate}
		onRestart={invaders.restart}
	/>
{:else if invaders.state.screen === 'highscores'}
	<HighScores score={invaders.state.score} onNavigate={invaders.navigate} />
{:else if invaders.state.screen === 'settings'}
	<Settings
		settings={invaders.state.settings}
		onUpdateSettings={invaders.updateSettings}
		onNavigate={invaders.navigate}
	/>
{:else if invaders.state.screen === 'help'}
	<Help onNavigate={invaders.navigate} />
{/if}
