import { createSignal, createMemo, createEffect, on, onCleanup } from 'solid-js'
import {
	timerReducer,
	createInitialTimerState,
	formatTime,
	type TimerState,
	type TimerAction,
	type TimerVariant,
	type TimeFormat,
	type ILap,
} from '@wolf-tui/shared'

//#region Types
export type UseTimerStateProps = {
	/**
	 * Timer variant: 'timer' (count up), 'countdown', or 'stopwatch' (with laps).
	 *
	 * @default 'timer'
	 */
	variant?: TimerVariant

	/**
	 * Duration in milliseconds (used for countdown).
	 *
	 * @default 0
	 */
	durationMs?: number

	/**
	 * Whether the timer starts automatically.
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
	 * Prefix text displayed before the time.
	 */
	prefix?: string

	/**
	 * Suffix text displayed after the time.
	 */
	suffix?: string

	/**
	 * Time display format.
	 *
	 * @default 'digital'
	 */
	format?: TimeFormat

	/**
	 * Called when the timer completes (countdown only).
	 */
	onComplete?: () => void

	/**
	 * Called on each tick with the current elapsed milliseconds.
	 */
	onTick?: (elapsedMs: number) => void

	/**
	 * Called when a new lap is recorded (stopwatch only).
	 */
	onLap?: (lap: ILap) => void
}

export type TimerStateResult = {
	formattedTime: () => string
	isRunning: () => boolean
	isPaused: () => boolean
	isComplete: () => boolean
	elapsedMs: () => number
	laps: () => readonly ILap[]
	variant: () => TimerVariant
	dispatch: (action: TimerAction) => void
}
//#endregion Types

//#region Composable
export const useTimerState = ({
	variant = 'timer',
	durationMs = 0,
	autoStart = true,
	interval = 1000,
	format = 'digital',
	prefix,
	suffix,
	onComplete,
	onTick,
	onLap,
}: UseTimerStateProps): TimerStateResult & {
	prefix?: string
	suffix?: string
} => {
	const initialState = createInitialTimerState({
		variant,
		durationMs,
		autoStart,
	})
	const [state, setState] = createSignal<TimerState>(initialState)

	const dispatch = (action: TimerAction) => {
		setState((prev) => {
			const next = timerReducer(prev, action)
			if (!prev.isComplete && next.isComplete) {
				onComplete?.()
			}
			if (action.type === 'lap' && next.laps.length > prev.laps.length) {
				const newLap = next.laps[next.laps.length - 1]
				if (newLap) {
					onLap?.(newLap)
				}
			}
			return next
		})
	}

	// Reset state when variant or durationMs changes
	createEffect(
		on(
			() => ({ variant, durationMs }),
			(
				newProps: { variant: TimerVariant; durationMs: number | undefined },
				oldProps:
					| { variant: TimerVariant; durationMs: number | undefined }
					| undefined
			) => {
				if (
					oldProps !== undefined &&
					(newProps.variant !== oldProps.variant ||
						newProps.durationMs !== oldProps.durationMs)
				) {
					stopInterval()
					setState(
						createInitialTimerState({
							variant: newProps.variant,
							durationMs: newProps.durationMs,
							autoStart,
						})
					)
				}
			},
			{ defer: true }
		)
	)

	//#region Interval Management
	let intervalId: ReturnType<typeof setInterval> | undefined
	let lastTickTime = 0

	function startInterval() {
		if (intervalId !== undefined) return
		lastTickTime = Date.now()
		intervalId = setInterval(() => {
			const now = Date.now()
			const deltaMs = now - lastTickTime
			lastTickTime = now
			dispatch({ type: 'tick', deltaMs })
			onTick?.(state().elapsedMs)
		}, interval)
	}

	function stopInterval() {
		if (intervalId !== undefined) {
			clearInterval(intervalId)
			intervalId = undefined
		}
	}

	const isRunning = createMemo(() => state().isRunning)

	// Track only isRunning changes -- interval must not restart on every tick
	createEffect(() => {
		if (isRunning()) {
			startInterval()
		} else {
			stopInterval()
		}
	})

	onCleanup(() => stopInterval())
	//#endregion Interval Management

	const formattedTime = createMemo(() => {
		const s = state()
		const ms =
			s.variant === 'countdown'
				? Math.max(0, s.durationMs - s.elapsedMs)
				: s.elapsedMs

		if (typeof format === 'function') {
			return format(ms)
		}

		return formatTime(ms, format).text
	})
	const isPaused = createMemo(
		() => !state().isRunning && state().elapsedMs > 0 && !state().isComplete
	)
	const isComplete = createMemo(() => state().isComplete)
	const elapsedMs = createMemo(() => state().elapsedMs)
	const laps = createMemo(() => state().laps)
	const variantSignal = createMemo(() => state().variant)

	return {
		formattedTime,
		isRunning,
		isPaused,
		isComplete,
		elapsedMs,
		laps,
		variant: variantSignal,
		dispatch,
		prefix,
		suffix,
	}
}
//#endregion Composable
