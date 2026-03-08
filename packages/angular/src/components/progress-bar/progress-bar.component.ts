import type { OnInit, OnDestroy, AfterViewInit, OnChanges } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	signal,
	computed,
	ElementRef,
	inject,
} from '@angular/core'
import type { DOMElement } from '@wolfie/core'
import { measureElement } from '@wolfie/core'
import { renderProgressBar, defaultProgressBarTheme } from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export interface ProgressBarProps {
	/**
	 * Progress.
	 * Must be between 0 and 100.
	 *
	 * @default 0
	 */
	value: number
}
//#endregion Types

//#region ProgressBarComponent
/**
 * `<w-progress-bar>` displays a visual progress indicator.
 */
@Component({
	selector: 'w-progress-bar',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent
	implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
	//#region Inputs
	@Input({ required: true }) value!: number
	//#endregion Inputs

	//#region Injected Dependencies
	private elementRef = inject(ElementRef)
	//#endregion Injected Dependencies

	//#region Internal State
	private _value = signal(0)
	private _width = signal(0)
	//#endregion Internal State

	//#region Computed Properties
	readonly wnode = computed(() =>
		renderProgressBar(
			{ value: this._value(), width: this._width() },
			defaultProgressBarTheme
		)
	)
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._value.set(this.value)
	}

	ngAfterViewInit(): void {
		this.measureWidth()
	}

	ngOnDestroy(): void {}

	ngOnChanges(): void {
		this._value.set(this.value)
	}
	//#endregion Lifecycle

	//#region Private Methods
	private measureWidth(): void {
		const el = this.elementRef.nativeElement as DOMElement
		if (el) {
			const dimensions = measureElement(el)
			if (dimensions.width !== this._width()) {
				this._width.set(dimensions.width)
			}
		}
	}
	//#endregion Private Methods
}
//#endregion ProgressBarComponent
