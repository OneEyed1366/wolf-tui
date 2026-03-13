import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	signal,
	computed,
	NgZone,
	inject,
} from '@angular/core'
import spinners, { type SpinnerName } from 'cli-spinners'
import {
	renderSpinner,
	defaultSpinnerTheme,
	type SpinnerRenderTheme,
} from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export interface SpinnerProps {
	/**
	 * Type of a spinner.
	 * See [cli-spinners](https://github.com/sindresorhus/cli-spinners) for available spinners.
	 *
	 * @default "dots"
	 */
	type?: SpinnerName

	/**
	 * Label to show near the spinner.
	 */
	label?: string
}
//#endregion Types

//#region SpinnerComponent
/**
 * `<w-spinner>` displays an animated loading spinner.
 */
@Component({
	selector: 'w-spinner',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() type: SpinnerName = 'dots'
	@Input() label?: string
	//#endregion Inputs

	//#region Injected Dependencies
	private ngZone = inject(NgZone)
	private cdr = inject(ChangeDetectorRef)
	//#endregion Injected Dependencies

	//#region Internal State
	private _type = signal<SpinnerName>('dots')
	private _frameIndex = signal(0)
	private timer: ReturnType<typeof setInterval> | null = null
	//#endregion Internal State

	//#region Computed Properties
	private readonly theme: SpinnerRenderTheme = defaultSpinnerTheme

	readonly wnode = computed(() =>
		renderSpinner(
			{
				frame: spinners[this._type()].frames[this._frameIndex()] ?? '',
				label: this.label,
			},
			this.theme
		)
	)
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._type.set(this.type)
		this.startSpinner()
	}

	ngOnDestroy(): void {
		this.stopSpinner()
	}

	ngOnChanges(): void {
		this._type.set(this.type)
		this.stopSpinner()
		this.startSpinner()
	}
	//#endregion Lifecycle

	//#region Private Methods
	private startSpinner(): void {
		const spinner = spinners[this._type()]

		// Run outside Angular zone to avoid unnecessary change detection
		this.ngZone.runOutsideAngular(() => {
			this.timer = setInterval(() => {
				this.ngZone.run(() => {
					const currentIndex = this._frameIndex()
					const isLastFrame = currentIndex === spinner.frames.length - 1
					this._frameIndex.set(isLastFrame ? 0 : currentIndex + 1)
					this.cdr.detectChanges()
				})
			}, spinner.interval)
		})
	}

	private stopSpinner(): void {
		if (this.timer) {
			clearInterval(this.timer)
			this.timer = null
		}
	}
	//#endregion Private Methods
}
//#endregion SpinnerComponent
