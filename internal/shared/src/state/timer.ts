import { formatTime, type IFormattedTime } from '../lib/time-format'

//#region Types
export type TimerVariant = 'timer' | 'countdown' | 'stopwatch'

export type ILap = {
	number: number
	durationMs: number
	cumulativeMs: number
	formatted: IFormattedTime
}

export type TimerState = {
	variant: TimerVariant
	isRunning: boolean
	elapsedMs: number
	durationMs: number
	isComplete: boolean
	laps: readonly ILap[]
	previousLapMs: number
}

export type TimerAction =
	| { type: 'tick'; deltaMs: number }
	| { type: 'start' }
	| { type: 'stop' }
	| { type: 'reset' }
	| { type: 'toggle' }
	| { type: 'lap' }
	| { type: 'restart' }
//#endregion Types

//#region Reducer
export function timerReducer(
	state: TimerState,
	action: TimerAction
): TimerState {
	switch (action.type) {
		case 'tick': {
			if (!state.isRunning || state.isComplete) {
				return state
			}

			const nextElapsed = state.elapsedMs + action.deltaMs

			if (state.variant === 'countdown') {
				const clamped = Math.min(nextElapsed, state.durationMs)
				const done = clamped >= state.durationMs
				return {
					...state,
					elapsedMs: clamped,
					isComplete: done,
					isRunning: done ? false : state.isRunning,
				}
			}

			return {
				...state,
				elapsedMs: nextElapsed,
			}
		}

		case 'start': {
			if (state.isComplete) {
				return state
			}
			return { ...state, isRunning: true }
		}

		case 'stop': {
			return { ...state, isRunning: false }
		}

		case 'toggle': {
			if (state.isComplete) {
				return state
			}
			return { ...state, isRunning: !state.isRunning }
		}

		case 'reset': {
			return createInitialTimerState({
				variant: state.variant,
				durationMs: state.durationMs,
			})
		}

		case 'lap': {
			if (state.variant !== 'stopwatch' || !state.isRunning) {
				return state
			}

			const lapDuration = state.elapsedMs - state.previousLapMs
			const newLap: ILap = {
				number: state.laps.length + 1,
				durationMs: lapDuration,
				cumulativeMs: state.elapsedMs,
				formatted: formatTime(lapDuration),
			}

			return {
				...state,
				laps: [...state.laps, newLap],
				previousLapMs: state.elapsedMs,
			}
		}

		case 'restart': {
			return {
				...createInitialTimerState({
					variant: state.variant,
					durationMs: state.durationMs,
				}),
				isRunning: true,
			}
		}

		default:
			return state
	}
}
//#endregion Reducer

//#region Factory
export function createInitialTimerState(options: {
	variant?: TimerVariant
	durationMs?: number
	autoStart?: boolean
}): TimerState {
	const variant = options.variant ?? 'timer'
	const durationMs = options.durationMs ?? 0

	return {
		variant,
		isRunning: options.autoStart !== false,
		elapsedMs: 0,
		durationMs,
		isComplete: false,
		laps: [],
		previousLapMs: 0,
	}
}
//#endregion Factory
