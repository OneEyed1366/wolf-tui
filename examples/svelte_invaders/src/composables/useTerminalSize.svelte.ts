import { onDestroy } from 'svelte'
import { useStdout } from '@wolfie/svelte'

//#region Types
export type TerminalSize = {
	readonly width: number
	readonly height: number
}
//#endregion Types

//#region Composable
export function useTerminalSize(): TerminalSize {
	const { stdout } = useStdout()

	let width = $state(stdout.columns ?? 80)
	let height = $state(stdout.rows ?? 24)

	const handleResize = () => {
		width = stdout.columns ?? 80
		height = stdout.rows ?? 24
	}

	stdout.on('resize', handleResize)

	onDestroy(() => {
		stdout.off('resize', handleResize)
	})

	return {
		get width() {
			return width
		},
		get height() {
			return height
		},
	}
}
//#endregion Composable
