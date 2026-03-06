import {
	Component,
	Input,
	computed,
	ChangeDetectionStrategy,
} from '@angular/core'
import { parseErrorToViewState, renderErrorOverview } from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export interface ErrorOverviewProps {
	/**
	 * The error object to display.
	 */
	error: Error
}
//#endregion Types

//#region ErrorOverviewComponent
/**
 * `<w-error-overview>` displays an error with its stack trace and code context.
 * It parses the error stack, extracts file locations, and shows surrounding code.
 */
@Component({
	selector: 'w-error-overview',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorOverviewComponent {
	@Input({ required: true }) error!: Error

	// WHY: computed reads this.error as a plain @Input field, not a signal.
	// Angular re-evaluates computed() on CD cycles when error changes.
	protected readonly wnode = computed(() =>
		renderErrorOverview(parseErrorToViewState(this.error))
	)
}
//#endregion ErrorOverviewComponent

export type { ErrorOverviewProps as Props, ErrorOverviewProps as IProps }
