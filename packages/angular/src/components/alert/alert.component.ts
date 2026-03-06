import type { OnInit, OnDestroy, OnChanges } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	signal,
	computed,
} from '@angular/core'
import { renderAlert, defaultAlertTheme } from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export type AlertVariant = 'info' | 'success' | 'error' | 'warning'

export interface AlertProps {
	/**
	 * Variant, which determines the color of the alert.
	 */
	variant: AlertVariant

	/**
	 * Title to show above the message.
	 */
	title?: string

	/**
	 * Message content.
	 */
	message?: string
}
//#endregion Types

//#region AlertComponent
/**
 * `<w-alert>` displays an alert message with different variants (info, success, error, warning).
 */
@Component({
	selector: 'w-alert',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent implements OnInit, OnDestroy, OnChanges {
	//#region Inputs
	@Input({ required: true }) variant!: AlertVariant
	@Input() title?: string
	@Input() message = ''
	//#endregion Inputs

	//#region Internal State
	private _variant = signal<AlertVariant>('info')
	//#endregion Internal State

	//#region Computed Properties
	readonly wnode = computed(() =>
		renderAlert(
			{ variant: this._variant(), title: this.title, message: this.message },
			defaultAlertTheme
		)
	)
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._variant.set(this.variant)
	}

	ngOnDestroy(): void {}

	ngOnChanges(): void {
		this._variant.set(this.variant)
	}
	//#endregion Lifecycle
}
//#endregion AlertComponent
