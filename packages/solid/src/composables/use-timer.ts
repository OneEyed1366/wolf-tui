import { createMemo } from 'solid-js'
import { useInput } from './use-input'
import type { TimerStateResult } from './use-timer-state'

//#region Types
export type UseTimerProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: () => boolean | undefined

	/**
	 * Timer state.
	 */
	state: TimerStateResult

	/**
	 * Whether lap list is shown (stopwatch only).
	 *
	 * @default true
	 */
	showLaps?: boolean
}
//#endregion Types

//#region Composable
export const useTimer = ({
	isDisabled,
	state,
	showLaps = true,
}: UseTimerProps) => {
	const isActive = createMemo(() => !(isDisabled?.() ?? false))

	useInput(
		(input, key) => {
			// Space: toggle start/stop
			if (input === ' ') {
				state.dispatch({ type: 'toggle' })
			}

			// r: reset
			if (input === 'r' || input === 'R') {
				state.dispatch({ type: 'reset' })
			}

			// l: record lap (stopwatch only)
			if (showLaps && (input === 'l' || input === 'L')) {
				state.dispatch({ type: 'lap' })
			}

			// Enter: restart if complete
			if (key.return) {
				if (state.isComplete()) {
					state.dispatch({ type: 'restart' })
				}
			}
		},
		{ isActive }
	)
}
//#endregion Composable
