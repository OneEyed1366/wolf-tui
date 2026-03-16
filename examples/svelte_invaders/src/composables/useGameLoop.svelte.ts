import { onDestroy } from 'svelte'
import { TICK_INTERVAL } from '../constants'

//#region Types
type UseGameLoopOptions = {
	onTick: () => void
	isRunning: () => boolean
	interval?: number
}
//#endregion Types

//#region Composable
export function useGameLoop({
	onTick,
	isRunning,
	interval = TICK_INTERVAL,
}: UseGameLoopOptions): void {
	let timer: ReturnType<typeof setInterval> | null = null

	const startLoop = () => {
		if (timer) return
		timer = setInterval(() => {
			onTick()
		}, interval)
	}

	const stopLoop = () => {
		if (timer) {
			clearInterval(timer)
			timer = null
		}
	}

	// Reactive effect: start/stop loop based on isRunning
	$effect(() => {
		if (isRunning()) {
			startLoop()
		} else {
			stopLoop()
		}
	})

	onDestroy(() => {
		stopLoop()
	})
}
//#endregion Composable
