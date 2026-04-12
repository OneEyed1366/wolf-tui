import { isDeepStrictEqual } from 'node:util'
import {
	ref,
	computed,
	watch,
	toValue,
	type ComputedRef,
	type MaybeRefOrGetter,
} from 'vue'
import {
	comboboxReducer,
	createDefaultComboboxState,
	type ComboboxAction,
	type Option,
} from '@wolf-tui/shared'
import type { ComboboxVisibleOption } from '@wolf-tui/shared'

//#region Types
export interface IUseComboboxStateProps {
	/**
	 * Options to display. Accepts plain value, ref, or getter for reactivity.
	 */
	options: MaybeRefOrGetter<Option[]>

	/**
	 * Default selected value.
	 */
	defaultValue?: string

	/**
	 * Number of visible options in the dropdown.
	 *
	 * @default 5
	 */
	visibleOptionCount?: number

	/**
	 * Placeholder text when input is empty.
	 *
	 * @default 'Type to search...'
	 */
	placeholder?: string

	/**
	 * Text shown when no options match.
	 *
	 * @default 'No matches'
	 */
	noMatchesText?: string

	/**
	 * Callback when input value changes.
	 */
	onChange?: (value: string) => void

	/**
	 * Callback when an option is selected.
	 */
	onSelect?: (value: string) => void
}

export interface IComboboxState {
	inputValue: ComputedRef<string>
	cursorOffset: ComputedRef<number>
	isOpen: ComputedRef<boolean>
	visibleOptions: ComputedRef<ComboboxVisibleOption[]>
	selectedValue: ComputedRef<string | undefined>
	hasScrollUp: ComputedRef<boolean>
	hasScrollDown: ComputedRef<boolean>
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
	options: optionsProp,
	defaultValue,
	visibleOptionCount = 5,
	placeholder: _placeholder = 'Type to search...',
	noMatchesText: _noMatchesText = 'No matches',
	onChange,
	onSelect,
}: IUseComboboxStateProps): IComboboxState => {
	const initialState = createDefaultComboboxState({
		options: toValue(optionsProp),
		defaultValue,
		visibleOptionCount,
	})

	const state = ref(initialState)

	//#region Derived State
	const inputValue = computed(() => state.value.inputValue)
	const cursorOffset = computed(() => state.value.cursorOffset)
	const isOpen = computed(() => state.value.isOpen)
	const selectedValue = computed(() => state.value.selectedValue)

	const hasScrollUp = computed(() => state.value.viewportFrom > 0)
	const hasScrollDown = computed(
		() => state.value.viewportTo < state.value.filteredOptions.length
	)

	const visibleOptions = computed((): ComboboxVisibleOption[] => {
		const { filteredOptions, viewportFrom, viewportTo, focusedIndex } =
			state.value
		const visible = filteredOptions.slice(viewportFrom, viewportTo)

		return visible.map((result, idx) => ({
			label: result.option.label,
			value: result.option.value,
			matchRanges: result.matchRanges,
			isFocused: viewportFrom + idx === focusedIndex,
		}))
	})
	//#endregion Derived State

	//#region Watchers
	// Reset state when options change
	const lastOptions = ref(toValue(optionsProp))

	watch(
		() => toValue(optionsProp),
		(newOptions) => {
			if (
				newOptions !== lastOptions.value &&
				!isDeepStrictEqual(newOptions, lastOptions.value)
			) {
				state.value = createDefaultComboboxState({
					options: newOptions,
					defaultValue,
					visibleOptionCount,
				})
				lastOptions.value = newOptions
			}
		},
		{ deep: true }
	)

	watch(
		() => state.value.inputValue,
		(newValue, oldValue) => {
			if (newValue !== oldValue) {
				onChange?.(newValue)
			}
		}
	)

	watch(
		() => state.value.selectedValue,
		(newValue, oldValue) => {
			if (newValue !== undefined && newValue !== oldValue) {
				onSelect?.(newValue)
			}
		}
	)
	//#endregion Watchers

	//#region Actions
	const dispatch = (action: ComboboxAction) => {
		state.value = comboboxReducer(state.value, action)
	}
	//#endregion Actions

	return {
		inputValue,
		cursorOffset,
		isOpen,
		visibleOptions,
		selectedValue,
		hasScrollUp,
		hasScrollDown,
		insertText: (text: string) => dispatch({ type: 'input-insert', text }),
		deleteChar: () => dispatch({ type: 'input-delete' }),
		deleteForward: () => dispatch({ type: 'input-delete-forward' }),
		cursorLeft: () => dispatch({ type: 'cursor-left' }),
		cursorRight: () => dispatch({ type: 'cursor-right' }),
		cursorStart: () => dispatch({ type: 'cursor-start' }),
		cursorEnd: () => dispatch({ type: 'cursor-end' }),
		focusNextOption: () => dispatch({ type: 'focus-next-option' }),
		focusPreviousOption: () => dispatch({ type: 'focus-previous-option' }),
		selectFocused: () => dispatch({ type: 'select-focused' }),
		autofillFocused: () => dispatch({ type: 'autofill-focused' }),
		close: () => dispatch({ type: 'close' }),
	}
}
//#endregion Composable
