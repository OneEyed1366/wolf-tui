import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	Output,
	EventEmitter,
	inject,
	computed,
	ChangeDetectionStrategy,
} from '@angular/core'
import { injectInput, type Key } from '../../services/stdin.service'
import { FocusService } from '../../services/focus.service'
import { renderConfirmInput, defaultConfirmInputTheme } from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export interface ConfirmInputProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Default choice.
	 *
	 * @default "confirm"
	 */
	defaultChoice?: 'confirm' | 'cancel'

	/**
	 * Confirm or cancel when user presses enter, depending on the `defaultChoice` value.
	 * Can be useful to disable when an explicit confirmation is required, such as pressing "Y" key.
	 *
	 * @default true
	 */
	submitOnEnter?: boolean

	/**
	 * Unique ID for focus management.
	 */
	id?: string

	/**
	 * Auto-focus this input when it mounts.
	 */
	autoFocus?: boolean
}
//#endregion Types

//#region ConfirmInputComponent
@Component({
	selector: 'w-confirm-input',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmInputComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() isDisabled = false
	@Input() defaultChoice: 'confirm' | 'cancel' = 'confirm'
	@Input() submitOnEnter = true
	@Input() id?: string
	@Input() autoFocus = false
	//#endregion Inputs

	//#region Outputs
	@Output() confirm = new EventEmitter<void>()
	@Output() cancel = new EventEmitter<void>()
	//#endregion Outputs

	//#region Injected Dependencies
	private focusService = inject(FocusService, { optional: true })
	//#endregion Injected Dependencies

	//#region Computed State
	private isFocused = computed(() => {
		if (!this.focusService || !this.id) {
			return !this.isDisabled
		}
		return this.focusService.isFocused(this.id)
	})

	private isActive = computed(() => {
		return !this.isDisabled && this.isFocused()
	})

	protected readonly wnode = computed(() =>
		renderConfirmInput(
			{ defaultChoice: this.defaultChoice, isDisabled: this.isDisabled },
			defaultConfirmInputTheme
		)
	)
	//#endregion Computed State

	//#region Constructor
	constructor() {
		// Set up input handling - must be called in constructor for DI context
		injectInput((input: string, key: Key) => this.handleInput(input, key), {
			isActive: () => this.isActive(),
		})
	}
	//#endregion Constructor

	//#region Input Handler
	private handleInput(input: string, key: Key): void {
		if (input.toLowerCase() === 'y') {
			this.confirm.emit()
			return
		}

		if (input.toLowerCase() === 'n') {
			this.cancel.emit()
			return
		}

		if (key.return && this.submitOnEnter) {
			if (this.defaultChoice === 'confirm') {
				this.confirm.emit()
			} else {
				this.cancel.emit()
			}
		}
	}
	//#endregion Input Handler

	//#region Lifecycle
	ngOnInit(): void {
		// Register with focus service if available and id is provided
		if (this.focusService && this.id) {
			this.focusService.addFocusable(this.id, { autoFocus: this.autoFocus })
		}
	}

	ngOnDestroy(): void {
		if (this.focusService && this.id) {
			this.focusService.removeFocusable(this.id)
		}
	}
	//#endregion Lifecycle
}
//#endregion ConfirmInputComponent
