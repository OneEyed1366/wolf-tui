import { type JSX, splitProps, createMemo } from 'solid-js'
import {
	renderTimer,
	defaultTimerTheme,
	type TimerRenderTheme,
	type TimerVariant,
	type TimeFormat,
	type ILap,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { useTimerState } from '../composables/use-timer-state'
import { useTimer } from '../composables/use-timer'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface ITimerProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Timer variant: 'timer', 'countdown', or 'stopwatch'.
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
	 * Time display format.
	 *
	 * @default 'digital'
	 */
	format?: TimeFormat

	/**
	 * Prefix text displayed before the time.
	 */
	prefix?: string

	/**
	 * Suffix text displayed after the time.
	 */
	suffix?: string

	/**
	 * Whether lap list is shown (stopwatch only).
	 *
	 * @default true
	 */
	showLaps?: boolean

	/**
	 * Maximum number of laps to display.
	 *
	 * @default 10
	 */
	maxLapsDisplay?: number

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
//#endregion Types

//#region Component
export function Timer(props: ITimerProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'variant',
		'durationMs',
		'autoStart',
		'interval',
		'format',
		'prefix',
		'suffix',
		'showLaps',
		'maxLapsDisplay',
		'onComplete',
		'onTick',
		'onLap',
	])

	const state = useTimerState({
		variant: () => local.variant,
		durationMs: () => local.durationMs,
		autoStart: local.autoStart,
		interval: local.interval,
		format: local.format,
		prefix: local.prefix,
		suffix: local.suffix,
		onComplete: local.onComplete,
		onTick: local.onTick,
		onLap: local.onLap,
	})

	useTimer({
		isDisabled: () => local.isDisabled,
		state,
		showLaps: local.showLaps,
	})

	const theme = useComponentTheme<TimerRenderTheme>('Timer')
	const { styles, config } = theme ?? defaultTimerTheme

	const wnode = createMemo(() =>
		renderTimer(
			{
				formattedTime: state.formattedTime(),
				isRunning: state.isRunning(),
				isPaused: state.isPaused(),
				variant: state.variant(),
				isComplete: state.isComplete(),
				laps: state.laps(),
				prefix: state.prefix,
				suffix: state.suffix,
			},
			{ styles, config }
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component

export {
	defaultTimerTheme as timerTheme,
	type TimerRenderTheme as TimerTheme,
} from '@wolf-tui/shared'
