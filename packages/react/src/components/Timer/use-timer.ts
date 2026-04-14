import { useInput } from '../../hooks/use-input'
import type { ITimerState } from './use-timer-state'

//#region Types
export type IUseTimerProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Enable keyboard controls (Space=toggle, R=reset, L=lap).
	 *
	 * @default true
	 */
	enableKeyboard?: boolean

	/**
	 * Timer variant, used to determine if lap key is active.
	 */
	variant?: string

	/**
	 * Timer state from useTimerState.
	 */
	state: ITimerState
}
//#endregion Types

//#region Hook
export function useTimer({
	isDisabled = false,
	enableKeyboard = true,
	variant,
	state,
}: IUseTimerProps): void {
	useInput(
		(input, _key) => {
			if (input === ' ') {
				state.toggle()
			}

			if (input === 'r' || input === 'R') {
				state.reset()
			}

			if ((input === 'l' || input === 'L') && variant === 'stopwatch') {
				state.lap()
			}
		},
		{ isActive: !isDisabled && enableKeyboard }
	)
}
//#endregion Hook
