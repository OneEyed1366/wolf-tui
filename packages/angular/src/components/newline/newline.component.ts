import {
	Component,
	Input,
	computed,
	ChangeDetectionStrategy,
} from '@angular/core'
import { renderNewline } from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region NewlineComponent
/**
 * `<w-newline>` adds one or more empty lines between components
 */
@Component({
	selector: 'w-newline',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewlineComponent {
	@Input() count = 1

	protected readonly wnode = computed(() =>
		renderNewline({ count: this.count })
	)
}
//#endregion NewlineComponent
