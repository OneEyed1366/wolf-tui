import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	signal,
	computed,
} from '@angular/core'
import { renderStatusMessage, defaultStatusMessageTheme } from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export type StatusMessageVariant = 'info' | 'success' | 'error' | 'warning'

export interface StatusMessageProps {
	/**
	 * Variant, which determines the color used in the status message.
	 */
	variant: StatusMessageVariant

	/**
	 * Message content.
	 */
	message?: string
}
//#endregion Types

//#region StatusMessageComponent
/**
 * `<w-status-message>` displays a status message with an icon (success checkmark, error X, etc.).
 */
@Component({
	selector: 'w-status-message',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusMessageComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input({ required: true }) variant!: StatusMessageVariant
	@Input() message = ''
	//#endregion Inputs

	//#region Internal State
	private _variant = signal<StatusMessageVariant>('info')
	//#endregion Internal State

	//#region Computed Properties
	readonly wnode = computed(() =>
		renderStatusMessage(
			{ variant: this._variant(), message: this.message },
			defaultStatusMessageTheme
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
//#endregion StatusMessageComponent
