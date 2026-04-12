import {
	timerReducer,
	createInitialTimerState,
	formatTime,
	type TimerState,
	type TimerVariant,
	type ILap,
	type TimeFormat,
} from '@wolf-tui/shared'

//#region Types
export type UseTimerStateProps = {
	variant?: () => TimerVariant | undefined
	durationMs?: () => number | undefined
	autoStart?: boolean
	interval?: number
	format?: TimeFormat
	onComplete?: () => void
	onTick?: (elapsedMs: number) => void
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
	variant: variantAccessor = (): TimerVariant | undefined => 'timer',
	durationMs: durationMsAccessor = () => 0,
	autoStart = true,
	interval = 1000,
	format = 'digital',
	onComplete,
	onTick,
	onLap,
}: UseTimerStateProps = {}): TimerStateResult => {
	const resolveVariant = (): TimerVariant => variantAccessor() ?? 'timer'
	const resolveDurationMs = (): number => durationMsAccessor() ?? 0

	const initial = createInitialTimerState({
		variant: resolveVariant(),
		durationMs: resolveDurationMs(),
		autoStart,
	})

	let _state = $state<TimerState>(initial)
	let _intervalId: ReturnType<typeof setInterval> | undefined
	let _lastTickTime = $state<number>(Date.now())

	const formattedTime = () => {
		const ms =
			resolveVariant() === 'countdown'
				? Math.max(0, _state.durationMs - _state.elapsedMs)
				: _state.elapsedMs

		if (typeof format === 'function') {
			return format(ms)
		}

		return formatTime(ms).text
	}

	const isRunning = () => _state.isRunning
	const isPaused = () =>
		!_state.isRunning && _state.elapsedMs > 0 && !_state.isComplete
	const isComplete = () => _state.isComplete
	const elapsedMs = () => _state.elapsedMs
	const laps = () => _state.laps
	const variantGetter = () => _state.variant

	const dispatch = (action: Parameters<typeof timerReducer>[1]) => {
		const prevState = _state
		_state = timerReducer(_state, action)

		if (!prevState.isComplete && _state.isComplete) {
			onComplete?.()
		}

		if (action.type === 'tick') {
			onTick?.(_state.elapsedMs)
		}

		if (action.type === 'lap' && _state.laps.length > prevState.laps.length) {
			const newLap = _state.laps[_state.laps.length - 1]
			if (newLap) {
				onLap?.(newLap)
			}
		}
	}

	const startInterval = () => {
		if (_intervalId !== undefined) return
		_lastTickTime = Date.now()
		_intervalId = setInterval(() => {
			const now = Date.now()
			const deltaMs = now - _lastTickTime
			_lastTickTime = now
			dispatch({ type: 'tick', deltaMs })
		}, interval)
	}

	const stopInterval = () => {
		if (_intervalId !== undefined) {
			clearInterval(_intervalId)
			_intervalId = undefined
		}
	}

	const start = () => {
		dispatch({ type: 'start' })
	}

	const stop = () => {
		dispatch({ type: 'stop' })
	}

	const toggle = () => {
		dispatch({ type: 'toggle' })
	}

	const reset = () => {
		stopInterval()
		dispatch({ type: 'reset' })
	}

	const restart = () => {
		stopInterval()
		dispatch({ type: 'restart' })
	}

	const lap = () => {
		dispatch({ type: 'lap' })
	}

	// Reset state when variant or durationMs changes
	let _lastVariant = resolveVariant()
	let _lastDurationMs = resolveDurationMs()

	$effect(() => {
		// Call accessors inside $effect so Svelte tracks the reactive reads
		const currentVariant = resolveVariant()
		const currentDurationMs = resolveDurationMs()

		if (
			currentVariant !== _lastVariant ||
			currentDurationMs !== _lastDurationMs
		) {
			stopInterval()
			_state = createInitialTimerState({
				variant: currentVariant,
				durationMs: currentDurationMs,
				autoStart,
			})
			_lastVariant = currentVariant
			_lastDurationMs = currentDurationMs
		}
	})

	// Sync interval with running state
	$effect(() => {
		if (_state.isRunning) {
			startInterval()
		} else {
			stopInterval()
		}

		return () => {
			stopInterval()
		}
	})

	return {
		formattedTime,
		isRunning,
		isPaused,
		isComplete,
		elapsedMs,
		laps,
		variant: variantGetter,
		start,
		stop,
		toggle,
		reset,
		restart,
		lap,
	}
}
//#endregion Composable
