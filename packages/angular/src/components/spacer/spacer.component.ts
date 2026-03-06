import { Component, ChangeDetectionStrategy } from '@angular/core'
import { renderSpacer } from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region SpacerComponent
/**
 * `<w-spacer>` fills remaining space in a flex container
 */
@Component({
	selector: 'w-spacer',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpacerComponent {
	// WHY: not a computed() — renderSpacer() is a static constant, no signals
	protected readonly wnode = renderSpacer()
}
//#endregion SpacerComponent
