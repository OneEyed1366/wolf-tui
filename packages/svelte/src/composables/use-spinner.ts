import { onDestroy } from 'svelte'
import spinners, { type SpinnerName } from 'cli-spinners'

//#region Types
export type UseSpinnerProps = { type?: SpinnerName }
export type UseSpinnerResult = { frame: () => string }
//#endregion Types

//#region Composable
export const useSpinner = ({
	type = 'dots',
}: UseSpinnerProps = {}): UseSpinnerResult => {
	const spinner = spinners[type]
	let frameIndex = 0

	const timer = setInterval(() => {
		frameIndex = (frameIndex + 1) % spinner.frames.length
	}, spinner.interval)

	onDestroy(() => clearInterval(timer))

	return { frame: () => spinner.frames[frameIndex] ?? '' }
}
//#endregion Composable
