import type { OnInit, OnDestroy, OnChanges } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	signal,
	computed,
} from '@angular/core'
import type { Styles } from '@wolfie/core'
import { renderBadge, defaultBadgeTheme } from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export interface BadgeProps {
	/**
	 * Color.
	 *
	 * @default "magenta"
	 */
	color?: Styles['color']

	/**
	 * Label text.
	 */
	label?: string
}
//#endregion Types

//#region BadgeComponent
/**
 * `<w-badge>` displays a small label/tag for status indicators.
 */
@Component({
	selector: 'w-badge',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent implements OnInit, OnDestroy, OnChanges {
	//#region Inputs
	@Input() color: Styles['color'] = 'magenta'
	@Input() label = ''
	//#endregion Inputs

	//#region Internal State
	private _color = signal<Styles['color']>('magenta')
	//#endregion Internal State

	//#region Computed Properties
	readonly wnode = computed(() =>
		renderBadge({ color: this._color(), label: this.label }, defaultBadgeTheme)
	)
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._color.set(this.color)
	}

	ngOnDestroy(): void {}

	ngOnChanges(): void {
		this._color.set(this.color)
	}
	//#endregion Lifecycle
}
//#endregion BadgeComponent
