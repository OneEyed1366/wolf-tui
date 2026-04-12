<!-- #region Script -->
<script lang="ts">
	import {
		renderTimer,
		defaultTimerTheme,
		type TimerRenderTheme,
		type TimerVariant,
		type ILap,
		type TimeFormat,
	} from '@wolf-tui/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useTimerState } from '../composables/use-timer-state.svelte.js'
	import { useTimer } from '../composables/use-timer.js'

	let {
		variant = 'timer',
		durationMs = 0,
		autoStart = true,
		interval = 1000,
		format = 'digital',
		isDisabled = false,
		showLaps = true,
		maxLapsDisplay = 10,
		prefix,
		suffix,
		onComplete,
		onTick,
		onLap,
	}: {
		variant?: TimerVariant
		durationMs?: number
		autoStart?: boolean
		interval?: number
		format?: TimeFormat
		isDisabled?: boolean
		showLaps?: boolean
		maxLapsDisplay?: number
		prefix?: string
		suffix?: string
		onComplete?: () => void
		onTick?: (elapsedMs: number) => void
		onLap?: (lap: ILap) => void
	} = $props()

	const state = useTimerState({
		variant,
		durationMs,
		autoStart,
		interval,
		format,
		onComplete,
		onTick,
		onLap,
	})

	useTimer({ isDisabled: () => isDisabled, state, showLaps })

	const theme = useComponentTheme<TimerRenderTheme>('Timer')
	const { styles } = theme ?? defaultTimerTheme

	let wnode = $derived(renderTimer(
		{
			formattedTime: state.formattedTime(),
			isRunning: state.isRunning(),
			isPaused: state.isPaused(),
			variant: state.variant(),
			isComplete: state.isComplete(),
			laps: state.laps(),
			prefix,
			suffix,
		},
		{ styles, config: (theme ?? defaultTimerTheme).config }
	))
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<wolfie-box use:mountWNode={wnode}></wolfie-box>
<!-- #endregion Template -->
