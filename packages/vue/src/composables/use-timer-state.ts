import {
	ref,
	computed,
	watch,
	onMounted,
	onUnmounted,
	type ComputedRef,
} from 'vue'
import {
	timerReducer,
	createInitialTimerState,
	formatTime,
	type TimerVariant,
	type TimeFormat,
	type ILap,
} from '@wolf-tui/shared'

//#region Types
export interface IUseTimerStateProps {
	/**
	 * Timer variant.
	 *
	 * @default 'timer'
	 */
	variant?: TimerVariant

	/**
	 * Start automatically on mount.
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
	 * Duration for countdown variant (ms).
	 */
	durationMs?: number

	/**
	 * Callback on each tick.
	 */
	onTick?: (elapsedMs: number) => void

	/**
	 * Callback when countdown completes.
	 */
	onComplete?: () => void

	/**
	 * Callback on lap.
	 */
	onLap?: (lap: ILap) => void
}

export interface ITimerState {
	formattedTime: ComputedRef<string>
	isRunning: ComputedRef<boolean>
	isPaused: ComputedRef<boolean>
	isComplete: ComputedRef<boolean>
	elapsedMs: ComputedRef<number>
	laps: ComputedRef<readonly ILap[]>
	variant: TimerVariant
	start: () => void
	stop: () => void
	toggle: () => void
	reset: () => void
	restart: () => void
	lap: () => void
}
//#endregion Types

//#region Composable
export const useTimerState = ({
	variant = 'timer',
	autoStart = true,
	interval = 1000,
	format = 'digital',
	durationMs = 0,
	onTick,
	onComplete,
	onLap,
}: IUseTimerStateProps): ITimerState => {
	const initialState = createInitialTimerState({
		variant,
		durationMs,
		autoStart,
	})

	const state = ref(initialState)

	const isRunning = computed(() => state.value.isRunning)
	const isPaused = computed(
		() =>
			!state.value.isRunning &&
			state.value.elapsedMs > 0 &&
			!state.value.isComplete
	)
	const isComplete = computed(() => state.value.isComplete)
	const elapsedMs = computed(() => state.value.elapsedMs)
	const laps = computed(() => state.value.laps)

	const formattedTime = computed(() => {
		const ms =
			variant === 'countdown'
				? Math.max(0, durationMs - state.value.elapsedMs)
				: state.value.elapsedMs
		return formatTime(ms, format).text
	})

	//#region Interval Management
	let timerId: ReturnType<typeof setTimeout> | undefined
	let anchorMs = 0

	function scheduleNextTick() {
		if (!state.value.isRunning) return

		const now = Date.now()
		const elapsed = now - anchorMs
		const drift = elapsed % interval
		const delay = interval - drift

		timerId = setTimeout(() => {
			const tickNow = Date.now()
			const deltaMs = tickNow - anchorMs
			anchorMs = tickNow

			state.value = timerReducer(state.value, { type: 'tick', deltaMs })
			scheduleNextTick()
		}, delay)
	}

	function startInterval() {
		stopInterval()
		anchorMs = Date.now()
		scheduleNextTick()
	}

	function stopInterval() {
		if (timerId !== undefined) {
			clearTimeout(timerId)
			timerId = undefined
		}
	}
	//#endregion Interval Management

	//#region Watchers
	// Reset state when variant or durationMs changes
	watch(
		() => ({ variant, durationMs }),
		(newProps, oldProps) => {
			if (
				newProps.variant !== oldProps.variant ||
				newProps.durationMs !== oldProps.durationMs
			) {
				stopInterval()
				state.value = createInitialTimerState({
					variant: newProps.variant,
					durationMs: newProps.durationMs,
					autoStart,
				})
				if (autoStart) {
					startInterval()
				}
			}
		},
		{ deep: true }
	)

	watch(
		() => state.value.isRunning,
		(running) => {
			if (running) {
				startInterval()
			} else {
				stopInterval()
			}
		}
	)

	watch(
		() => state.value.elapsedMs,
		(newMs) => {
			onTick?.(newMs)
		}
	)

	watch(
		() => state.value.isComplete,
		(complete) => {
			if (complete) {
				onComplete?.()
			}
		}
	)

	watch(
		() => state.value.laps.length,
		(newLen, oldLen) => {
			if (newLen > oldLen) {
				const lastLap = state.value.laps[state.value.laps.length - 1]
				if (lastLap) {
					onLap?.(lastLap)
				}
			}
		}
	)
	//#endregion Watchers

	onMounted(() => {
		if (state.value.isRunning) {
			startInterval()
		}
	})

	onUnmounted(() => {
		stopInterval()
	})

	//#region Actions
	const dispatch = (
		type: 'start' | 'stop' | 'toggle' | 'reset' | 'restart' | 'lap'
	) => {
		state.value = timerReducer(state.value, { type })
	}
	//#endregion Actions

	return {
		formattedTime,
		isRunning,
		isPaused,
		isComplete,
		elapsedMs,
		laps,
		variant,
		start: () => dispatch('start'),
		stop: () => dispatch('stop'),
		toggle: () => dispatch('toggle'),
		reset: () => dispatch('reset'),
		restart: () => dispatch('restart'),
		lap: () => dispatch('lap'),
	}
}
//#endregion Composable
