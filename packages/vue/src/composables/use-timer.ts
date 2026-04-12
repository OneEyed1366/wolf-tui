import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useInput } from './use-input'
import type { ITimerState } from './use-timer-state'

//#region Types
export interface IUseTimerProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: MaybeRefOrGetter<boolean | undefined>

	/**
	 * Timer state.
	 */
	state: ITimerState
}
//#endregion Types

//#region Composable
export const useTimer = ({ isDisabled = false, state }: IUseTimerProps) => {
	const isActive = computed(() => !toValue(isDisabled))

	useInput(
		(_input, key) => {
			// Space: toggle start/stop
			if (_input === ' ') {
				state.toggle()
			}

			// r: reset
			if (_input === 'r' || _input === 'R') {
				state.reset()
			}

			// l: record lap (stopwatch only)
			if (_input === 'l' || _input === 'L') {
				state.lap()
			}

			// Enter: restart
			if (key.return) {
				state.restart()
			}
		},
		{ isActive }
	)
}
//#endregion Composable
