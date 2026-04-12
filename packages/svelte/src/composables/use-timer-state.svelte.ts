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
	variant?: TimerVariant
	durationMs?: number
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
	variant = 'timer',
	durationMs = 0,
	autoStart = true,
	interval = 1000,
	format = 'digital',
	onComplete,
	onTick,
	onLap,
}: UseTimerStateProps = {}): TimerStateResult => {
	const initial = createInitialTimerState({ variant, durationMs, autoStart })

	let _state = $state<TimerState>(initial)
	let _intervalId: ReturnType<typeof setInterval> | undefined
	let _lastTickTime = $state<number>(Date.now())

	const formattedTime = () => {
		const ms =
			_state.variant === 'countdown'
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
	const variantAccessor = () => _state.variant

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
	let _lastVariant = variant
	let _lastDurationMs = durationMs

	$effect(() => {
		// Access reactive props to track them
		const currentVariant = variant
		const currentDurationMs = durationMs

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
		variant: variantAccessor,
		start,
		stop,
		toggle,
		reset,
		restart,
		lap,
	}
}
//#endregion Composable
