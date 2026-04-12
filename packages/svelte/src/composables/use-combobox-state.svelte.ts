import { isDeepStrictEqual } from 'node:util'
import {
	comboboxReducer,
	createDefaultComboboxState,
	type ComboboxState,
	type Option,
} from '@wolf-tui/shared'
import type { ComboboxVisibleOption } from '@wolf-tui/shared'

//#region Types
export type UseComboboxStateProps = {
	options: Option[]
	defaultValue?: string
	visibleOptionCount?: number
	placeholder?: string
	noMatchesText?: string
	onChange?: (inputValue: string) => void
	onSelect?: (value: string) => void
}

export type ComboboxStateResult = {
	inputValue: () => string
	cursorOffset: () => number
	isOpen: () => boolean
	visibleOptions: () => ComboboxVisibleOption[]
	selectedValue: () => string | undefined
	isDisabled: () => boolean
	placeholder: () => string
	noMatchesText: () => string
	hasScrollUp: () => boolean
	hasScrollDown: () => boolean
	insertText: (text: string) => void
	deleteChar: () => void
	deleteForward: () => void
	cursorLeft: () => void
	cursorRight: () => void
	cursorStart: () => void
	cursorEnd: () => void
	focusNextOption: () => void
	focusPreviousOption: () => void
	selectFocused: () => void
	autofillFocused: () => void
	close: () => void
}
//#endregion Types

//#region Composable
export const useComboboxState = ({
	options,
	defaultValue,
	visibleOptionCount = 5,
	placeholder = 'Search...',
	noMatchesText = 'No matches',
	onChange,
	onSelect,
}: UseComboboxStateProps): ComboboxStateResult => {
	const initial = createDefaultComboboxState({
		options,
		defaultValue,
		visibleOptionCount,
	})

	let _state = $state<ComboboxState>(initial)
	const _isDisabled = false

	// Reset state when options change
	let _lastOptions = options

	$effect(() => {
		const currentOptions = options
		if (
			currentOptions !== _lastOptions &&
			!isDeepStrictEqual(currentOptions, _lastOptions)
		) {
			_state = createDefaultComboboxState({
				options: currentOptions,
				defaultValue,
				visibleOptionCount,
			})
			_lastOptions = currentOptions
		}
	})

	const dispatch = (action: Parameters<typeof comboboxReducer>[1]) => {
		const prevState = _state
		_state = comboboxReducer(_state, action)

		if (
			prevState.selectedValue !== _state.selectedValue &&
			_state.selectedValue !== undefined
		) {
			onSelect?.(_state.selectedValue)
		}

		if (prevState.inputValue !== _state.inputValue) {
			onChange?.(_state.inputValue)
		}
	}

	const inputValue = () => _state.inputValue
	const cursorOffset = () => _state.cursorOffset
	const isOpen = () => _state.isOpen

	const visibleOptions = (): ComboboxVisibleOption[] => {
		const slice = _state.filteredOptions.slice(
			_state.viewportFrom,
			_state.viewportTo
		)
		return slice.map((fr, idx) => ({
			label: fr.option.label,
			value: fr.option.value,
			matchRanges: fr.matchRanges,
			isFocused: _state.viewportFrom + idx === _state.focusedIndex,
		}))
	}

	const selectedValue = () => _state.selectedValue
	const isDisabled = () => _isDisabled
	const placeholderAccessor = () => placeholder
	const noMatchesTextAccessor = () => noMatchesText

	const hasScrollUp = () => _state.viewportFrom > 0
	const hasScrollDown = () => _state.viewportTo < _state.filteredOptions.length

	const insertText = (text: string) => dispatch({ type: 'input-insert', text })
	const deleteChar = () => dispatch({ type: 'input-delete' })
	const deleteForward = () => dispatch({ type: 'input-delete-forward' })
	const cursorLeft = () => dispatch({ type: 'cursor-left' })
	const cursorRight = () => dispatch({ type: 'cursor-right' })
	const cursorStart = () => dispatch({ type: 'cursor-start' })
	const cursorEnd = () => dispatch({ type: 'cursor-end' })
	const focusNextOption = () => dispatch({ type: 'focus-next-option' })
	const focusPreviousOption = () => dispatch({ type: 'focus-previous-option' })
	const selectFocused = () => dispatch({ type: 'select-focused' })
	const autofillFocused = () => dispatch({ type: 'autofill-focused' })
	const close = () => dispatch({ type: 'close' })

	return {
		inputValue,
		cursorOffset,
		isOpen,
		visibleOptions,
		selectedValue,
		isDisabled,
		placeholder: placeholderAccessor,
		noMatchesText: noMatchesTextAccessor,
		hasScrollUp,
		hasScrollDown,
		insertText,
		deleteChar,
		deleteForward,
		cursorLeft,
		cursorRight,
		cursorStart,
		cursorEnd,
		focusNextOption,
		focusPreviousOption,
		selectFocused,
		autofillFocused,
		close,
	}
}
//#endregion Composable
