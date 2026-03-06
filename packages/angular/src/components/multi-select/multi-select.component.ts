import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	signal,
	computed,
} from '@angular/core'
import { injectInput, type Key } from '../../services/stdin.service'
import {
	OptionMap,
	type Option,
	renderMultiSelect,
	defaultMultiSelectTheme,
} from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export interface MultiSelectProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Number of visible options.
	 *
	 * @default 5
	 */
	visibleOptionCount?: number

	/**
	 * Highlight text in option labels.
	 * Useful for filtering options.
	 */
	highlightText?: string

	/**
	 * Options.
	 */
	options: Option[]

	/**
	 * Initially selected option values.
	 */
	defaultValue?: string[]
}
//#endregion Types

//#region MultiSelectComponent
@Component({
	selector: 'w-multi-select',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectComponent implements OnInit, OnDestroy {
	//#region Internal State
	private _isDisabled = signal(false)
	private optionMap = signal<OptionMap>(new OptionMap([]))
	private visibleCount = signal(5)
	readonly focusedValue = signal<string | undefined>(undefined)
	private visibleFromIndex = signal(0)
	private visibleToIndex = signal(5)
	readonly value = signal<string[]>([])
	private previousValue = signal<string[]>([])
	private lastOptions = signal<Option[]>([])
	//#endregion Internal State

	//#region Inputs
	@Input() set isDisabled(value: boolean) {
		this._isDisabled.set(value)
	}
	get isDisabled(): boolean {
		return this._isDisabled()
	}
	@Input() visibleOptionCount = 5
	@Input() highlightText?: string
	@Input() options: Option[] = []
	@Input() defaultValue?: string[]
	//#endregion Inputs

	//#region Outputs
	@Output() selectionChange = new EventEmitter<string[]>()
	@Output() submitSelection = new EventEmitter<string[]>()
	//#endregion Outputs

	//#region Computed State
	readonly visibleOptions = computed(() => {
		const options = this.lastOptions()
		return options
			.map((option, index) => ({ ...option, index }))
			.slice(this.visibleFromIndex(), this.visibleToIndex())
	})

	readonly wnode = computed(() =>
		renderMultiSelect(
			{
				visibleOptions: this.visibleOptions(),
				focusedValue: this.focusedValue(),
				value: this.value(),
				isDisabled: this._isDisabled(),
				highlightText: this.highlightText,
			},
			defaultMultiSelectTheme
		)
	)
	//#endregion Computed State

	//#region Constructor
	constructor() {
		injectInput((input: string, key: Key) => this.handleInput(input, key), {
			isActive: () => !this._isDisabled(),
		})
	}
	//#endregion Constructor

	//#region State Operations
	private focusNextOption(): void {
		const currentFocused = this.focusedValue()
		if (!currentFocused) return

		const item = this.optionMap().get(currentFocused)
		if (!item) return

		const next = item.next
		if (!next) return

		const needsToScroll = next.index >= this.visibleToIndex()

		if (!needsToScroll) {
			this.focusedValue.set(next.value)
			return
		}

		const nextVisibleToIndex = Math.min(
			this.optionMap().size,
			this.visibleToIndex() + 1
		)
		const nextVisibleFromIndex = nextVisibleToIndex - this.visibleCount()

		this.focusedValue.set(next.value)
		this.visibleFromIndex.set(nextVisibleFromIndex)
		this.visibleToIndex.set(nextVisibleToIndex)
	}

	private focusPreviousOption(): void {
		const currentFocused = this.focusedValue()
		if (!currentFocused) return

		const item = this.optionMap().get(currentFocused)
		if (!item) return

		const previous = item.previous
		if (!previous) return

		const needsToScroll = previous.index < this.visibleFromIndex()

		if (!needsToScroll) {
			this.focusedValue.set(previous.value)
			return
		}

		const nextVisibleFromIndex = Math.max(0, this.visibleFromIndex() - 1)
		const nextVisibleToIndex = nextVisibleFromIndex + this.visibleCount()

		this.focusedValue.set(previous.value)
		this.visibleFromIndex.set(nextVisibleFromIndex)
		this.visibleToIndex.set(nextVisibleToIndex)
	}

	private toggleFocusedOption(): void {
		const currentFocused = this.focusedValue()
		if (!currentFocused) return

		const currentValue = this.value()

		if (currentValue.includes(currentFocused)) {
			// Remove from selection
			const newValue = currentValue.filter((v) => v !== currentFocused)
			this.previousValue.set(currentValue)
			this.value.set(newValue)
			this.selectionChange.emit(newValue)
		} else {
			// Add to selection
			const newValue = [...currentValue, currentFocused]
			this.previousValue.set(currentValue)
			this.value.set(newValue)
			this.selectionChange.emit(newValue)
		}
	}

	private submit(): void {
		this.submitSelection.emit(this.value())
	}
	//#endregion State Operations

	//#region Input Handler
	private handleInput(input: string, key: Key): void {
		if (key.downArrow) {
			this.focusNextOption()
		}

		if (key.upArrow) {
			this.focusPreviousOption()
		}

		if (input === ' ') {
			this.toggleFocusedOption()
		}

		if (key.return) {
			this.submit()
		}
	}
	//#endregion Input Handler

	//#region Lifecycle
	ngOnInit(): void {
		this.initializeState()
	}

	ngOnDestroy(): void {}

	ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
		// Only re-initialize when options change, NOT when isDisabled changes
		// Resetting state on isDisabled change causes selected values to be lost
		if (
			changes['options'] ||
			changes['visibleOptionCount'] ||
			changes['defaultValue']
		) {
			this.initializeState()
		}
	}

	private initializeState(): void {
		const options = this.options
		const visibleOptionCount = Math.min(this.visibleOptionCount, options.length)
		const newOptionMap = new OptionMap(options)
		const initialValue = this.defaultValue ?? []

		this.optionMap.set(newOptionMap)
		this.visibleCount.set(visibleOptionCount)
		this.focusedValue.set(newOptionMap.first?.value)
		this.visibleFromIndex.set(0)
		this.visibleToIndex.set(visibleOptionCount)
		this.previousValue.set(initialValue)
		this.value.set(initialValue)
		this.lastOptions.set(options)
	}
	//#endregion Lifecycle
}
//#endregion MultiSelectComponent
