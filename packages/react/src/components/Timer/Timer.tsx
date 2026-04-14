import {
	renderTimer,
	defaultTimerTheme,
	type TimerRenderTheme,
	type TimerVariant,
	type TimeFormat,
	type ILap,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../../theme/theme'
import { useTimerState } from './use-timer-state'
import { useTimer } from './use-timer'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type ITimerProps = {
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
	 * Text prefix before the time display.
	 */
	prefix?: string

	/**
	 * Text suffix after the time display.
	 */
	suffix?: string

	/**
	 * Show laps list (stopwatch only).
	 *
	 * @default true
	 */
	showLaps?: boolean

	/**
	 * Maximum number of laps to display.
	 */
	maxLapsDisplay?: number

	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

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
//#endregion Types

//#region Component
export function Timer({
	variant = 'timer',
	autoStart = true,
	interval = 1000,
	format = 'digital',
	durationMs,
	prefix,
	suffix,
	showLaps = true,
	maxLapsDisplay,
	isDisabled = false,
	onTick,
	onComplete,
	onLap,
}: ITimerProps) {
	const state = useTimerState({
		variant,
		autoStart,
		interval,
		format,
		durationMs,
		onTick,
		onComplete,
		onLap,
	})

	useTimer({ isDisabled, variant, state })

	const theme = useComponentTheme<TimerRenderTheme>('Timer')
	const resolvedTheme = theme ?? defaultTimerTheme
	const { styles } = resolvedTheme

	const displayLaps =
		showLaps && variant === 'stopwatch'
			? maxLapsDisplay !== undefined
				? state.laps.slice(-maxLapsDisplay)
				: state.laps
			: []

	return wNodeToReact(
		renderTimer(
			{
				formattedTime: state.formatted.text,
				isRunning: state.isRunning,
				isPaused: !state.isRunning && state.elapsedMs > 0,
				variant,
				isComplete: state.isComplete,
				laps: displayLaps,
				prefix,
				suffix,
			},
			{ styles, config: resolvedTheme.config }
		)
	)
}
//#endregion Component
