<script lang="ts">
	import { onDestroy } from 'svelte'
	import { Box, Text, useInput, useStdin } from '@wolfie/svelte'
	import GameCanvas from '../components/GameCanvas.svelte'
	import HUD from '../components/HUD.svelte'
	import KillLog from '../components/KillLog.svelte'
	import Controls from '../components/Controls.svelte'
	import { useGameLoop } from '../composables/useGameLoop.svelte'
	import type { State, Screen } from '../composables/useInvaders.svelte'
	import { ALIEN_SHOOT_INTERVAL } from '../constants'
	import { debugLog } from '../debug'
	import { BRAND } from '../theme'

	//#region Props
	let { gameState, onTick, onMovePlayer, onShoot, onAlienShoot, onPause, onNextWave, onNavigate }: {
		gameState: State
		onTick: () => void
		onMovePlayer: (dx: number) => void
		onShoot: () => void
		onAlienShoot: () => void
		onPause: () => void
		onNextWave: () => void
		onNavigate: (screen: Screen) => void
	} = $props()
	//#endregion Props

	const { isRawModeSupported } = useStdin()

	//#region FPS Calculation
	let fps = $state(0)
	let lastFrameTime = Date.now()
	let frameCount = 0

	$effect(() => {
		void gameState.frame
		frameCount++
		const now = Date.now()
		const elapsed = now - lastFrameTime

		if (elapsed >= 1000) {
			fps = Math.round((frameCount * 1000) / elapsed)
			frameCount = 0
			lastFrameTime = now
		}
	})
	//#endregion FPS Calculation

	//#region Game Loop
	let isRunning = $derived(!gameState.paused && !gameState.waveTransition)
	useGameLoop({
		onTick: () => onTick(),
		isRunning: () => isRunning,
	})
	//#endregion Game Loop

	//#region Alien Shooting
	let alienShootInterval: ReturnType<typeof setInterval> | null = null

	function startAlienShooting() {
		if (alienShootInterval) return
		alienShootInterval = setInterval(() => {
			onAlienShoot()
		}, ALIEN_SHOOT_INTERVAL)
	}

	function stopAlienShooting() {
		if (alienShootInterval) {
			clearInterval(alienShootInterval)
			alienShootInterval = null
		}
	}

	$effect(() => {
		if (gameState.paused || gameState.waveTransition) {
			stopAlienShooting()
		} else {
			startAlienShooting()
		}
	})

	onDestroy(() => {
		stopAlienShooting()
	})
	//#endregion Alien Shooting

	//#region Wave Transition
	$effect(() => {
		if (gameState.waveTransition) {
			const timer = setTimeout(() => {
				onNextWave()
			}, 2000)
			return () => clearTimeout(timer)
		}
	})
	//#endregion Wave Transition

	//#region Input Handling
	useInput((input, key) => {
		if (input === 'p') {
			onPause()
			return
		}

		if (input === 'q') {
			onNavigate('menu')
			return
		}

		if (gameState.paused) return

		if (key.leftArrow) {
			onMovePlayer(-1)
		} else if (key.rightArrow) {
			onMovePlayer(1)
		} else if (input === ' ') {
			debugLog('Input: SPACE pressed')
			onShoot()
		}
	})
	//#endregion Input Handling

	//#region Computed
	let pauseMarginTop = $derived(Math.floor(gameState.board.height / 2))
	//#endregion Computed
</script>

{#if gameState.waveTransition}
	<!-- Wave transition screen -->
	<Box
		style={{
			width: '100vw',
			height: '100vh',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: BRAND.bgAccent,
		}}
	>
		<Box
			style={{
				flexDirection: 'column',
				alignItems: 'center',
				borderStyle: 'round',
				borderColor: BRAND.success,
				paddingLeft: 2,
				paddingRight: 2,
				paddingTop: 1,
				paddingBottom: 1,
			}}
		>
			<Text style={{ color: BRAND.success }} className="font-bold">
				✓ Wave Complete!
			</Text>
			<Text>Excellent work, Commander! Preparing next wave…</Text>
		</Box>

		<Box style={{ marginTop: 2 }}>
			<Text className="text-cyan">
				Loading Wave {gameState.wave + 1}…
			</Text>
		</Box>

		<Box style={{ marginTop: 2 }}>
			<Text className="text-yellow font-bold">
				Score: {gameState.score}
			</Text>
		</Box>
	</Box>
{:else}
	<!-- Main game screen -->
	<Box
		style={{
			width: '100vw',
			height: '100vh',
			flexDirection: 'column',
			backgroundColor: BRAND.bgDark,
		}}
	>
		<!-- Header -->
		<Box
			style={{
				flexShrink: 0,
				paddingLeft: 1,
				paddingRight: 1,
				backgroundColor: BRAND.bgDark,
			}}
		>
			<HUD
				score={gameState.score}
				lives={gameState.lives}
				wave={gameState.wave}
				showFps={gameState.settings.showFps}
				{fps}
			/>
		</Box>

		<!-- Main game area -->
		<Box
			style={{
				flexGrow: 1,
				flexDirection: 'column',
				minHeight: 0,
				overflow: 'hidden',
			}}
		>
			<GameCanvas
				aliens={gameState.aliens}
				bullets={gameState.bullets}
				shields={gameState.shields}
				playerX={gameState.player.x}
				frame={gameState.frame}
				boardWidth={gameState.board.width}
				boardHeight={gameState.board.height}
			/>
		</Box>

		<!-- Pause indicator -->
		{#if gameState.paused}
			<Box
				style={{
					position: 'absolute',
					width: '100vw',
					justifyContent: 'center',
					marginTop: pauseMarginTop,
				}}
			>
				<Text className="text-yellow font-bold bg-red">
					{'  '}══ PAUSED ══ (P to resume){'  '}
				</Text>
			</Box>
		{/if}

		<!-- Footer -->
		<Box
			style={{
				flexShrink: 0,
				flexDirection: 'row',
				justifyContent: 'space-between',
				paddingLeft: 2,
				paddingRight: 2,
				backgroundColor: BRAND.bgAccent,
				paddingTop: 1,
			}}
		>
			<KillLog kills={gameState.kills.slice(-3)} />
			<Controls />
		</Box>

		{#if !isRawModeSupported}
			<Box
				style={{
					borderStyle: 'round',
					borderColor: BRAND.warning,
					paddingLeft: 1,
					paddingRight: 1,
				}}
			>
				<Text style={{ color: BRAND.warning }}>
					⚠ Raw mode not supported — input may be limited
				</Text>
			</Box>
		{/if}
	</Box>
{/if}
