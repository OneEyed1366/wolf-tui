import { isDeepStrictEqual } from 'node:util'
import { createSignal, createMemo, createEffect, on } from 'solid-js'
import {
	comboboxReducer,
	createDefaultComboboxState,
	type ComboboxState,
	type ComboboxAction,
	type Option,
} from '@wolf-tui/shared'
import type { ComboboxVisibleOption } from '@wolf-tui/shared'

//#region Types
export type UseComboboxStateProps = {
	/**
	 * Options to search through.
	 */
	options: Option[]

	/**
	 * Default selected value.
	 */
	defaultValue?: string

	/**
	 * Number of visible options in the dropdown.
	 *
	 * @default options.length
	 */
	visibleOptionCount?: number

	/**
	 * Placeholder text shown when input is empty.
	 *
	 * @default 'Search...'
	 */
	placeholder?: string

	/**
	 * Text shown when no options match.
	 *
	 * @default 'No matches'
	 */
	noMatchesText?: string

	/**
	 * Called when the input value changes.
	 */
	onChange?: (value: string) => void

	/**
	 * Called when a value is selected.
	 */
	onSelect?: (value: string) => void
}

export type ComboboxStateResult = {
	inputValue: () => string
	cursorOffset: () => number
	isOpen: () => boolean
	visibleOptions: () => ComboboxVisibleOption[]
	selectedValue: () => string | undefined
	hasScrollUp: () => boolean
	hasScrollDown: () => boolean
	dispatch: (action: ComboboxAction) => void
}
//#endregion Types

//#region Composable
export const useComboboxState = ({
	options,
	defaultValue,
	visibleOptionCount,
	placeholder = 'Search...',
	noMatchesText = 'No matches',
	onChange,
	onSelect,
}: UseComboboxStateProps): ComboboxStateResult & {
	placeholder: string
	noMatchesText: string
} => {
	const initialState = createDefaultComboboxState({
		options,
		defaultValue,
		visibleOptionCount,
	})

	const [state, setState] = createSignal<ComboboxState>(initialState)

	const dispatch = (action: ComboboxAction) => {
		setState((prev) => comboboxReducer(prev, action))
	}

	// Reset state when options change
	const [lastOptions, setLastOptions] = createSignal(options)

	createEffect(
		on(
			() => JSON.stringify(options),
			() => {
				if (!isDeepStrictEqual(options, lastOptions())) {
					setState(
						createDefaultComboboxState({
							options,
							defaultValue,
							visibleOptionCount,
						})
					)
					setLastOptions(options)
				}
			},
			{ defer: true }
		)
	)

	// Watch for selection changes
	createEffect(
		on(
			() => state().selectedValue,
			(newValue, oldValue) => {
				if (newValue !== undefined && newValue !== oldValue) {
					onSelect?.(newValue)
				}
			},
			{ defer: true }
		)
	)

	// Watch for input changes
	createEffect(
		on(
			() => state().inputValue,
			(newValue, oldValue) => {
				if (newValue !== oldValue) {
					onChange?.(newValue)
				}
			},
			{ defer: true }
		)
	)

	const inputValue = createMemo(() => state().inputValue)
	const cursorOffset = createMemo(() => state().cursorOffset)
	const isOpen = createMemo(() => state().isOpen)
	const selectedValue = createMemo(() => state().selectedValue)

	const visibleOptions = createMemo((): ComboboxVisibleOption[] => {
		const s = state()
		const { filteredOptions, viewportFrom, viewportTo, focusedIndex } = s

		const visible: ComboboxVisibleOption[] = []
		for (
			let i = viewportFrom;
			i < viewportTo && i < filteredOptions.length;
			i++
		) {
			const result = filteredOptions[i]!
			visible.push({
				label: result.option.label,
				value: result.option.value,
				matchRanges: result.matchRanges,
				isFocused: i === focusedIndex,
			})
		}

		return visible
	})

	const hasScrollUp = createMemo(() => state().viewportFrom > 0)
	const hasScrollDown = createMemo(() => {
		const s = state()
		return s.viewportTo < s.filteredOptions.length
	})

	return {
		inputValue,
		cursorOffset,
		isOpen,
		visibleOptions,
		selectedValue,
		hasScrollUp,
		hasScrollDown,
		dispatch,
		placeholder,
		noMatchesText,
	}
}
//#endregion Composable
