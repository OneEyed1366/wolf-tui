import { useInput } from './use-input.js'
import type { TimerStateResult } from './use-timer-state.svelte.js'

//#region Types
export type UseTimerProps = {
	isDisabled?: () => boolean | undefined
	state: TimerStateResult
	showLaps?: boolean
}
//#endregion Types

//#region Composable
export const useTimer = ({
	isDisabled,
	state,
	showLaps = true,
}: UseTimerProps) => {
	const isActive = () => !(isDisabled?.() ?? false)

	useInput(
		(_input, _key) => {
			// Space: toggle start/stop
			if (_input === ' ') {
				state.toggle()
			}

			// r: reset
			if (_input === 'r') {
				state.reset()
			}

			// R (shift+r): restart
			if (_input === 'R') {
				state.restart()
			}

			// l: record lap (stopwatch variant only)
			if (showLaps && _input === 'l') {
				state.lap()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
