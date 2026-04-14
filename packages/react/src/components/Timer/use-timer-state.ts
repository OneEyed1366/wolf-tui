import { useReducer, useCallback, useEffect, useRef, useState } from 'react'
import {
	timerReducer,
	createInitialTimerState,
	formatTime,
	type TimerState,
	type TimerAction,
	type TimerVariant,
	type ILap,
	type IFormattedTime,
	type TimeFormat,
} from '@wolf-tui/shared'

//#region Extended Reducer
type ExtendedTimerAction = TimerAction | { type: 'reinit'; state: TimerState }

const extendedTimerReducer = (
	state: TimerState,
	action: ExtendedTimerAction
): TimerState => {
	if (action.type === 'reinit') {
		return action.state
	}
	return timerReducer(state, action)
}
//#endregion Extended Reducer

//#region Types
export type IUseTimerStateProps = {
	/**
	 * Timer variant: 'timer' (count up), 'countdown', or 'stopwatch' (with laps).
	 *
	 * @default 'timer'
	 */
	variant?: TimerVariant

	/**
	 * Start the timer automatically on mount.
	 *
	 * @default true
	 */
	autoStart?: boolean

	/**
	 * Tick interval in milliseconds.
	 *
	 * @default 1000
	 */
	interval?: number

	/**
	 * Time display format.
	 *
	 * @default 'digital'
	 */
	format?: TimeFormat

	/**
	 * Total duration for countdown variant (milliseconds).
	 */
	durationMs?: number

	/**
	 * Callback fired on each tick with elapsed milliseconds.
	 */
	onTick?: (elapsedMs: number) => void

	/**
	 * Callback fired when countdown completes.
	 */
	onComplete?: () => void

	/**
	 * Callback fired when a new lap is recorded (stopwatch only).
	 */
	onLap?: (lap: ILap) => void
}

export type ITimerState = {
	elapsedMs: number
	isRunning: boolean
	isComplete: boolean
	laps: readonly ILap[]
	formatted: IFormattedTime

	start: () => void
	stop: () => void
	toggle: () => void
	reset: () => void
	restart: () => void
	lap: () => void
}
//#endregion Types

//#region Hook
export function useTimerState({
	variant = 'timer',
	autoStart = true,
	interval = 1000,
	format = 'digital',
	durationMs,
	onTick,
	onComplete,
	onLap,
}: IUseTimerStateProps): ITimerState {
	const [state, dispatch] = useReducer(
		extendedTimerReducer,
		{ variant, durationMs, autoStart },
		createInitialTimerState
	)

	// Reset state when variant or durationMs changes
	const [lastVariant, setLastVariant] = useState(variant)
	const [lastDurationMs, setLastDurationMs] = useState(durationMs)

	if (variant !== lastVariant || durationMs !== lastDurationMs) {
		dispatch({
			type: 'reinit',
			state: createInitialTimerState({ variant, durationMs, autoStart }),
		})
		setLastVariant(variant)
		setLastDurationMs(durationMs)
	}

	const startedAtRef = useRef<number | undefined>(undefined)
	const accumulatedRef = useRef(0)
	const intervalIdRef = useRef<ReturnType<typeof setInterval> | undefined>(
		undefined
	)
	const prevElapsedRef = useRef(state.elapsedMs)
	const prevLapsLengthRef = useRef(state.laps.length)
	const prevIsCompleteRef = useRef(state.isComplete)

	// Start/stop the interval based on isRunning
	useEffect(() => {
		if (state.isRunning) {
			startedAtRef.current = Date.now()
			accumulatedRef.current = state.elapsedMs

			intervalIdRef.current = setInterval(() => {
				const now = Date.now()
				const deltaMs = now - (startedAtRef.current ?? now)
				const totalElapsed = accumulatedRef.current + deltaMs
				dispatch({
					type: 'tick',
					deltaMs: totalElapsed - accumulatedRef.current,
				})
				accumulatedRef.current = totalElapsed
				startedAtRef.current = now
			}, interval)

			return () => {
				if (intervalIdRef.current !== undefined) {
					clearInterval(intervalIdRef.current)
					intervalIdRef.current = undefined
				}
			}
		}

		// Not running -- clear any existing interval
		if (intervalIdRef.current !== undefined) {
			clearInterval(intervalIdRef.current)
			intervalIdRef.current = undefined
		}

		return undefined
	}, [state.isRunning, interval])

	// onTick callback
	useEffect(() => {
		if (state.elapsedMs !== prevElapsedRef.current) {
			prevElapsedRef.current = state.elapsedMs
			onTick?.(state.elapsedMs)
		}
	}, [state.elapsedMs, onTick])

	// onComplete callback
	useEffect(() => {
		if (state.isComplete && !prevIsCompleteRef.current) {
			onComplete?.()
		}
		prevIsCompleteRef.current = state.isComplete
	}, [state.isComplete, onComplete])

	// onLap callback
	useEffect(() => {
		if (state.laps.length > prevLapsLengthRef.current) {
			const latestLap = state.laps[state.laps.length - 1]
			if (latestLap) {
				onLap?.(latestLap)
			}
		}
		prevLapsLengthRef.current = state.laps.length
	}, [state.laps, onLap])

	const start = useCallback(() => {
		dispatch({ type: 'start' })
	}, [])

	const stop = useCallback(() => {
		dispatch({ type: 'stop' })
	}, [])

	const toggle = useCallback(() => {
		dispatch({ type: 'toggle' })
	}, [])

	const reset = useCallback(() => {
		dispatch({ type: 'reset' })
	}, [])

	const restart = useCallback(() => {
		dispatch({ type: 'restart' })
	}, [])

	const lap = useCallback(() => {
		dispatch({ type: 'lap' })
	}, [])

	const displayMs =
		variant === 'countdown' && durationMs !== undefined
			? Math.max(0, durationMs - state.elapsedMs)
			: state.elapsedMs

	const formatted = formatTime(displayMs, format)

	return {
		elapsedMs: state.elapsedMs,
		isRunning: state.isRunning,
		isComplete: state.isComplete,
		laps: state.laps,
		formatted,
		start,
		stop,
		toggle,
		reset,
		restart,
		lap,
	}
}
//#endregion Hook
