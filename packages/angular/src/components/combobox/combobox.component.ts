import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	signal,
	computed,
	inject,
} from '@angular/core'
import {
	comboboxReducer,
	createDefaultComboboxState,
	renderCombobox,
	defaultComboboxTheme,
	type ComboboxRenderTheme,
	type ComboboxState,
	type ComboboxAction,
	type Option,
	type ComboboxVisibleOption,
} from '@wolf-tui/shared'
import { injectInput, type Key } from '../../services/stdin.service'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'
import { THEME_CONTEXT, useComponentTheme } from '../../theme'

//#region Types
export interface ComboboxProps {
	/** Available options to search/select from. */
	options: Option[]
	/** Placeholder text when input is empty. @default 'Search...' */
	placeholder?: string
	/** Text shown when no options match. @default 'No matches' */
	noMatchesText?: string
	/** Pre-selected value. */
	defaultValue?: string
	/** Number of visible options in dropdown. @default 5 */
	visibleOptionCount?: number
	/** When disabled, user input is ignored. @default false */
	isDisabled?: boolean
}
//#endregion Types

//#region ComboboxComponent
@Component({
	selector: 'w-combobox',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() options: Option[] = []
	@Input() placeholder = 'Search...'
	@Input() noMatchesText = 'No matches'
	@Input() defaultValue?: string
	@Input() visibleOptionCount = 5
	@Input() set isDisabled(value: boolean) {
		this._isDisabled.set(value)
	}
	get isDisabled(): boolean {
		return this._isDisabled()
	}
	//#endregion Inputs

	//#region Outputs
	@Output() valueChange = new EventEmitter<string>()
	@Output() select = new EventEmitter<string>()
	//#endregion Outputs

	//#region Injected Dependencies
	private globalTheme = inject(THEME_CONTEXT)
	//#endregion Injected Dependencies

	//#region Internal State
	private _isDisabled = signal(false)
	private state = signal<ComboboxState>(
		createDefaultComboboxState({ options: [] })
	)
	//#endregion Internal State

	//#region Computed State
	private readonly visibleOptions = computed((): ComboboxVisibleOption[] => {
		const s = this.state()
		return s.filteredOptions
			.slice(s.viewportFrom, s.viewportTo)
			.map((filtered, idx) => ({
				label: filtered.option.label,
				value: filtered.option.value,
				matchRanges: filtered.matchRanges,
				isFocused: s.viewportFrom + idx === s.focusedIndex,
			}))
	})

	private readonly resolvedTheme = computed(
		() =>
			useComponentTheme<ComboboxRenderTheme>(this.globalTheme, 'Combobox') ??
			defaultComboboxTheme
	)

	readonly wnode = computed(() => {
		const s = this.state()
		return renderCombobox(
			{
				inputValue: s.inputValue,
				cursorOffset: s.cursorOffset,
				isOpen: s.isOpen,
				visibleOptions: this.visibleOptions(),
				selectedValue: s.selectedValue,
				isDisabled: this._isDisabled(),
				placeholder: this.placeholder,
				noMatchesText: this.noMatchesText,
				hasScrollUp: s.viewportFrom > 0,
				hasScrollDown: s.viewportTo < s.filteredOptions.length,
			},
			this.resolvedTheme()
		)
	})
	//#endregion Computed State

	//#region Constructor
	constructor() {
		injectInput((input: string, key: Key) => this.handleInput(input, key), {
			isActive: () => !this._isDisabled(),
		})
	}
	//#endregion Constructor

	//#region Input Handler
	private handleInput(input: string, key: Key): void {
		if (key.downArrow) {
			this.dispatch({ type: 'focus-next-option' })
			return
		}

		if (key.upArrow) {
			this.dispatch({ type: 'focus-previous-option' })
			return
		}

		if (key.return) {
			this.handleSelect()
			return
		}

		if (key.escape) {
			const s = this.state()
			if (s.isOpen || s.inputValue.length > 0) {
				this.dispatch({ type: 'close' })
				return
			}
		}

		if (key.backspace || key.delete) {
			this.dispatch({ type: 'input-delete' })
			this.emitValueChange()
			return
		}

		if (key.ctrl && input === 'd') {
			this.dispatch({ type: 'input-delete-forward' })
			this.emitValueChange()
			return
		}

		if (key.leftArrow) {
			this.dispatch({ type: 'cursor-left' })
			return
		}

		if (key.rightArrow) {
			this.dispatch({ type: 'cursor-right' })
			return
		}

		if (key.home) {
			this.dispatch({ type: 'cursor-start' })
			return
		}

		if (key.end) {
			this.dispatch({ type: 'cursor-end' })
			return
		}

		if (key.tab) {
			this.dispatch({ type: 'autofill-focused' })
			this.emitValueChange()
			return
		}

		// Regular character input
		if (input && !key.ctrl && !key.meta) {
			this.dispatch({ type: 'input-insert', text: input })
			this.emitValueChange()
		}
	}
	//#endregion Input Handler

	//#region State Operations
	private dispatch(action: ComboboxAction): void {
		const next = comboboxReducer(this.state(), action)
		this.state.set(next)
	}

	private handleSelect(): void {
		const prev = this.state()
		this.dispatch({ type: 'select-focused' })
		const next = this.state()

		if (
			next.selectedValue !== undefined &&
			next.selectedValue !== prev.selectedValue
		) {
			this.select.emit(next.selectedValue)
			this.valueChange.emit(next.inputValue)
		}
	}

	private emitValueChange(): void {
		this.valueChange.emit(this.state().inputValue)
	}
	//#endregion State Operations

	//#region Lifecycle
	ngOnInit(): void {
		this.initializeState()
	}

	ngOnDestroy(): void {}

	ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
		if (
			changes['options'] ||
			changes['defaultValue'] ||
			changes['visibleOptionCount']
		) {
			this.initializeState()
		}
	}

	private initializeState(): void {
		this.state.set(
			createDefaultComboboxState({
				options: this.options,
				defaultValue: this.defaultValue,
				visibleOptionCount: this.visibleOptionCount,
			})
		)
	}
	//#endregion Lifecycle
}
//#endregion ComboboxComponent
