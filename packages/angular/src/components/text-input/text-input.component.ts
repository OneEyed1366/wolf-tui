import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	Output,
	EventEmitter,
	inject,
	signal,
	computed,
	ChangeDetectionStrategy,
} from '@angular/core'
import chalk from 'chalk'
import { injectInput, type Key } from '../../services/stdin.service'
import { FocusService } from '../../services/focus.service'
import { renderTextInput, defaultTextInputTheme } from '@wolf-tui/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export interface TextInputProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Text to display when input is empty.
	 */
	placeholder?: string

	/**
	 * Default input value.
	 */
	defaultValue?: string

	/**
	 * Suggestions to autocomplete the input value.
	 */
	suggestions?: string[]

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

//#region Constants
let _CURSOR: string | undefined
const getCursor = () => (_CURSOR ??= chalk.inverse(' '))
//#endregion Constants

//#region TextInputComponent
@Component({
	selector: 'w-text-input',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextInputComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() isDisabled = false
	@Input() placeholder = ''
	@Input() defaultValue = ''
	@Input() suggestions?: string[]
	@Input() id?: string
	@Input() autoFocus = false
	//#endregion Inputs

	//#region Outputs
	@Output() valueChange = new EventEmitter<string>()
	@Output() submitValue = new EventEmitter<string>()
	//#endregion Outputs

	//#region Injected Dependencies
	private focusService = inject(FocusService, { optional: true })
	//#endregion Injected Dependencies

	//#region Internal State
	private previousValue = signal('')
	private value = signal('')
	private cursorOffset = signal(0)
	//#endregion Internal State

	//#region Computed State
	private suggestion = computed(() => {
		const currentValue = this.value()
		if (currentValue.length === 0 || !this.suggestions) {
			return undefined
		}

		return this.suggestions
			?.find((s) => s.startsWith(currentValue))
			?.replace(currentValue, '')
	})

	private isFocused = computed(() => {
		if (!this.focusService || !this.id) {
			return !this.isDisabled
		}
		return this.focusService.isFocused(this.id)
	})

	private isActive = computed(() => {
		return !this.isDisabled && this.isFocused()
	})

	private renderedPlaceholder = computed(() => {
		if (this.isDisabled) {
			return this.placeholder ? chalk.dim(this.placeholder) : ''
		}

		if (!this.isFocused()) {
			return this.placeholder ? chalk.dim(this.placeholder) : ''
		}

		return this.placeholder && this.placeholder.length > 0
			? chalk.inverse(this.placeholder[0]!) +
					chalk.dim(this.placeholder.slice(1))
			: getCursor()
	})

	private renderedValue = computed(() => {
		const currentValue = this.value()
		const currentCursorOffset = this.cursorOffset()
		const currentSuggestion = this.suggestion()

		if (this.isDisabled || !this.isFocused()) {
			return currentValue
		}

		let index = 0
		let result = currentValue.length > 0 ? '' : getCursor()

		for (const char of currentValue) {
			result += index === currentCursorOffset ? chalk.inverse(char) : char
			index++
		}

		if (currentSuggestion) {
			if (currentCursorOffset === currentValue.length) {
				result +=
					chalk.inverse(currentSuggestion[0]!) +
					chalk.dim(currentSuggestion.slice(1))
			} else {
				result += chalk.dim(currentSuggestion)
			}

			return result
		}

		if (
			currentValue.length > 0 &&
			currentCursorOffset === currentValue.length
		) {
			result += getCursor()
		}

		return result
	})

	protected inputValue = computed(() => {
		return this.value().length > 0
			? this.renderedValue()
			: this.renderedPlaceholder()
	})

	protected readonly wnode = computed(() =>
		renderTextInput({ inputValue: this.inputValue() }, defaultTextInputTheme)
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

	//#region State Operations
	private moveCursorLeft(): void {
		this.cursorOffset.update((offset) => Math.max(0, offset - 1))
	}

	private moveCursorRight(): void {
		this.cursorOffset.update((offset) =>
			Math.min(this.value().length, offset + 1)
		)
	}

	private insert(text: string): void {
		const currentValue = this.value()
		const currentOffset = this.cursorOffset()

		this.previousValue.set(currentValue)
		this.value.set(
			currentValue.slice(0, currentOffset) +
				text +
				currentValue.slice(currentOffset)
		)
		this.cursorOffset.set(currentOffset + text.length)

		// Emit change
		if (this.value() !== this.previousValue()) {
			this.valueChange.emit(this.value())
		}
	}

	private deleteChar(): void {
		const currentValue = this.value()
		const currentOffset = this.cursorOffset()
		const newCursorOffset = Math.max(0, currentOffset - 1)

		this.previousValue.set(currentValue)
		this.value.set(
			currentValue.slice(0, newCursorOffset) +
				currentValue.slice(newCursorOffset + 1)
		)
		this.cursorOffset.set(newCursorOffset)

		// Emit change
		if (this.value() !== this.previousValue()) {
			this.valueChange.emit(this.value())
		}
	}

	private submit(): void {
		const currentSuggestion = this.suggestion()
		if (currentSuggestion) {
			this.insert(currentSuggestion)
			this.submitValue.emit(this.value())
			return
		}

		this.submitValue.emit(this.value())
	}
	//#endregion State Operations

	//#region Input Handler
	private handleInput(input: string, key: Key): void {
		if (
			key.upArrow ||
			key.downArrow ||
			(key.ctrl && input === 'c') ||
			key.tab ||
			(key.shift && key.tab)
		) {
			return
		}

		if (key.return) {
			this.submit()
			return
		}

		if (key.leftArrow) {
			this.moveCursorLeft()
		} else if (key.rightArrow) {
			this.moveCursorRight()
		} else if (key.backspace || key.delete) {
			this.deleteChar()
		} else if (input) {
			this.insert(input)
		}
	}
	//#endregion Input Handler

	//#region Lifecycle
	ngOnInit(): void {
		// Initialize with default value
		if (this.defaultValue) {
			this.value.set(this.defaultValue)
			this.previousValue.set(this.defaultValue)
			this.cursorOffset.set(this.defaultValue.length)
		}

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
//#endregion TextInputComponent
