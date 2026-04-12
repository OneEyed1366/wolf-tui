import {
	defineComponent,
	toRef,
	type PropType,
	type DefineComponent,
} from 'vue'
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
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface TimerProps {
	/**
	 * Timer variant: 'timer' | 'countdown' | 'stopwatch'.
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
	 * @default false
	 */
	showLaps?: boolean

	/**
	 * Maximum number of laps to display.
	 *
	 * @default 10
	 */
	maxLapsDisplay?: number

	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

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
//#endregion Types

//#region Component
export const Timer: DefineComponent<TimerProps> = defineComponent({
	name: 'Timer',
	props: {
		variant: {
			type: String as PropType<TimerVariant>,
			default: 'timer',
		},
		autoStart: {
			type: Boolean,
			default: true,
		},
		interval: {
			type: Number,
			default: 1000,
		},
		format: {
			type: [String, Function] as PropType<TimeFormat>,
			default: 'digital',
		},
		durationMs: {
			type: Number,
			default: 0,
		},
		prefix: {
			type: String,
			default: undefined,
		},
		suffix: {
			type: String,
			default: undefined,
		},
		showLaps: {
			type: Boolean,
			default: false,
		},
		maxLapsDisplay: {
			type: Number,
			default: 10,
		},
		isDisabled: {
			type: Boolean,
			default: false,
		},
		onTick: {
			type: Function as PropType<(elapsedMs: number) => void>,
			default: undefined,
		},
		onComplete: {
			type: Function as PropType<() => void>,
			default: undefined,
		},
		onLap: {
			type: Function as PropType<(lap: ILap) => void>,
			default: undefined,
		},
	},
	setup(props) {
		const state = useTimerState({
			variant: props.variant,
			autoStart: props.autoStart,
			interval: props.interval,
			format: props.format,
			durationMs: props.durationMs,
			onTick: props.onTick,
			onComplete: props.onComplete,
			onLap: props.onLap,
		})

		useTimer({ isDisabled: toRef(props, 'isDisabled'), state })

		const theme = useComponentTheme<TimerRenderTheme>('Timer')
		const { styles, config } = theme ?? defaultTimerTheme

		return () => {
			const displayLaps = props.showLaps
				? state.laps.value.slice(-(props.maxLapsDisplay ?? 10))
				: []

			return wNodeToVue(
				renderTimer(
					{
						formattedTime: state.formattedTime.value,
						isRunning: state.isRunning.value,
						isPaused: state.isPaused.value,
						variant: state.variant,
						isComplete: state.isComplete.value,
						laps: displayLaps,
						prefix: props.prefix,
						suffix: props.suffix,
					},
					{ styles, config }
				)
			)
		}
	},
})
//#endregion Component

export { defaultTimerTheme as timerTheme, type TimerRenderTheme as TimerTheme }
export type { TimerProps as Props, TimerProps as IProps }
