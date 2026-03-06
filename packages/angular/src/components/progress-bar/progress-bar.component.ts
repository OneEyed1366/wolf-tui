import type { AfterViewInit } from '@angular/core'
import {
	Component,
	Input,
	signal,
	computed,
	ElementRef,
	inject,
	ChangeDetectionStrategy,
} from '@angular/core'
import { measureElement } from '@wolfie/core'
import {
	renderProgressBar,
	defaultProgressBarTheme,
	type ProgressBarRenderTheme,
} from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

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
export class ProgressBarComponent implements AfterViewInit {
	@Input({ required: true }) value!: number

	private readonly width = signal(0)
	// WHY: inject(ElementRef) to measure host element width in ngAfterViewInit
	private readonly el = inject(ElementRef)

	protected readonly wnode = computed(() =>
		renderProgressBar(
			{ value: this.value, width: this.width() },
			defaultProgressBarTheme
		)
	)

	ngAfterViewInit(): void {
		const dimensions = measureElement(this.el.nativeElement)
		this.width.set(dimensions.width)
	}
}
//#endregion ProgressBarComponent

export { defaultProgressBarTheme as progressBarTheme }
export type { ProgressBarRenderTheme as ProgressBarProps }
