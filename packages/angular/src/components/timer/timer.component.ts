import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	signal,
	computed,
	NgZone,
	inject,
} from '@angular/core'
import {
	timerReducer,
	createInitialTimerState,
	formatTime,
	renderTimer,
	defaultTimerTheme,
	type TimerRenderTheme,
	type TimerState,
	type TimerAction,
	type TimerVariant,
	type ILap,
	type TimeFormat,
} from '@wolf-tui/shared'
import { injectInput, type Key } from '../../services/stdin.service'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'
import { THEME_CONTEXT, useComponentTheme } from '../../theme'

//#region Types
export interface TimerProps {
	/** Timer variant: 'timer' (counts up), 'countdown' (counts down to durationMs), 'stopwatch' (with laps). */
	variant?: TimerVariant
	/** Auto-start the timer on mount. @default true */
	autoStart?: boolean
	/** Tick interval in milliseconds. @default 1000 */
	interval?: number
	/** Time format preset or custom formatter. @default 'digital' */
	format?: TimeFormat
	/** Duration in ms for countdown variant. */
	durationMs?: number
	/** Text prefix before the time display. */
	prefix?: string
	/** Text suffix after the time display. */
	suffix?: string
	/** Show lap list (stopwatch variant). @default false */
	showLaps?: boolean
	/** Maximum number of laps to display. @default 10 */
	maxLapsDisplay?: number
	/** When disabled, user input is ignored. @default false */
	isDisabled?: boolean
}
//#endregion Types

//#region TimerComponent
@Component({
	selector: 'w-timer',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() variant: TimerVariant = 'timer'
	@Input() autoStart = true
	@Input() interval = 1000
	@Input() format: TimeFormat = 'digital'
	@Input() durationMs = 0
	@Input() prefix?: string
	@Input() suffix?: string
	@Input() showLaps = false
	@Input() maxLapsDisplay = 10
	@Input() set isDisabled(value: boolean) {
		this._isDisabled.set(value)
	}
	get isDisabled(): boolean {
		return this._isDisabled()
	}
	//#endregion Inputs

	//#region Outputs
	@Output() tick = new EventEmitter<number>()
	@Output() complete = new EventEmitter<void>()
	@Output() lap = new EventEmitter<ILap>()
	//#endregion Outputs

	//#region Injected Dependencies
	private ngZone = inject(NgZone)
	private cdr = inject(ChangeDetectorRef)
	private globalTheme = inject(THEME_CONTEXT)
	//#endregion Injected Dependencies

	//#region Internal State
	private _isDisabled = signal(false)
	private state = signal<TimerState>(
		createInitialTimerState({ variant: 'timer', autoStart: true })
	)
	private timer: ReturnType<typeof setInterval> | null = null
	private lastLapCount = 0
	//#endregion Internal State

	//#region Computed State
	private readonly formattedTime = computed(() => {
		const s = this.state()
		const elapsed =
			s.variant === 'countdown'
				? Math.max(0, s.durationMs - s.elapsedMs)
				: s.elapsedMs
		return formatTime(elapsed, this.format).text
	})

	private readonly displayLaps = computed(() => {
		const s = this.state()
		if (!this.showLaps) return []
		const laps = s.laps
		if (laps.length <= this.maxLapsDisplay) return laps
		return laps.slice(laps.length - this.maxLapsDisplay)
	})

	private readonly resolvedTheme = computed(
		() =>
			useComponentTheme<TimerRenderTheme>(this.globalTheme, 'Timer') ??
			defaultTimerTheme
	)

	readonly wnode = computed(() => {
		const s = this.state()
		return renderTimer(
			{
				formattedTime: this.formattedTime(),
				isRunning: s.isRunning,
				isPaused: !s.isRunning && s.elapsedMs > 0 && !s.isComplete,
				variant: s.variant,
				isComplete: s.isComplete,
				laps: this.displayLaps(),
				prefix: this.prefix,
				suffix: this.suffix,
			},
			this.resolvedTheme()
		)
	})
	//#endregion Computed State

	//#region Constructor
	constructor() {
		injectInput((input: string, key: Key) => this.handleInput(input, key), {
			isActive: () => !this._isDisabled(),
		})
	}
	//#endregion Constructor

	//#region Input Handler
	private handleInput(_input: string, key: Key): void {
		if (key.return) {
			// Toggle start/stop
			this.dispatch({ type: 'toggle' })
		}

		if (key.escape) {
			// Reset
			this.dispatch({ type: 'reset' })
			this.stopTimer()
		}

		// Space = lap (stopwatch only)
		if (_input === ' ' && this.state().variant === 'stopwatch') {
			this.dispatch({ type: 'lap' })
		}
	}
	//#endregion Input Handler

	//#region State Operations
	private dispatch(action: TimerAction): void {
		const prev = this.state()
		const next = timerReducer(prev, action)
		this.state.set(next)

		// Emit lap event if a new lap was added
		if (next.laps.length > prev.laps.length) {
			const newLap = next.laps[next.laps.length - 1]
			if (newLap) {
				this.lap.emit(newLap)
			}
		}

		// Emit complete event
		if (!prev.isComplete && next.isComplete) {
			this.complete.emit()
		}

		// Start/stop interval based on running state
		if (!prev.isRunning && next.isRunning) {
			this.startTimer()
		} else if (prev.isRunning && !next.isRunning) {
			this.stopTimer()
		}
	}
	//#endregion State Operations

	//#region Lifecycle
	ngOnInit(): void {
		this.state.set(
			createInitialTimerState({
				variant: this.variant,
				durationMs: this.durationMs,
				autoStart: this.autoStart,
			})
		)
		this.lastLapCount = 0

		if (this.autoStart) {
			this.startTimer()
		}
	}

	ngOnDestroy(): void {
		this.stopTimer()
	}

	ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
		if (changes['variant'] || changes['durationMs'] || changes['autoStart']) {
			this.stopTimer()
			this.state.set(
				createInitialTimerState({
					variant: this.variant,
					durationMs: this.durationMs,
					autoStart: this.autoStart,
				})
			)
			this.lastLapCount = 0
			if (this.autoStart) {
				this.startTimer()
			}
		}
	}
	//#endregion Lifecycle

	//#region Timer Control
	private startTimer(): void {
		if (this.timer !== null) return

		this.ngZone.runOutsideAngular(() => {
			this.timer = setInterval(() => {
				this.ngZone.run(() => {
					const prev = this.state()
					if (!prev.isRunning) return

					this.dispatch({ type: 'tick', deltaMs: this.interval })
					this.tick.emit(this.state().elapsedMs)
					this.cdr.detectChanges()
				})
			}, this.interval)
		})
	}

	private stopTimer(): void {
		if (this.timer !== null) {
			clearInterval(this.timer)
			this.timer = null
		}
	}
	//#endregion Timer Control
}
//#endregion TimerComponent
