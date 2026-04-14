import { isDeepStrictEqual } from 'node:util'
import {
	useReducer,
	useCallback,
	useMemo,
	useEffect,
	useRef,
	useState,
} from 'react'
import {
	comboboxReducer,
	createDefaultComboboxState,
	type ComboboxState,
	type Option,
} from '@wolf-tui/shared'

//#region Types
export type IUseComboboxStateProps = {
	/**
	 * Options to filter and select from.
	 */
	options: Option[]

	/**
	 * Placeholder text shown when input is empty.
	 *
	 * @default ''
	 */
	placeholder?: string

	/**
	 * Initially selected option's value.
	 */
	defaultValue?: string

	/**
	 * Number of visible options in the dropdown.
	 *
	 * @default 5
	 */
	visibleOptionCount?: number

	/**
	 * Callback when input value changes.
	 */
	onChange?: (value: string) => void

	/**
	 * Callback when an option is selected.
	 */
	onSelect?: (value: string) => void
}

export type IComboboxState = {
	inputValue: string
	cursorOffset: number
	isOpen: boolean
	focusedIndex: number
	selectedValue: string | undefined
	filteredOptionsCount: number
	viewportFrom: number
	viewportTo: number
	visibleOptions: ComboboxState['filteredOptions']

	inputInsert: (text: string) => void
	inputDelete: () => void
	inputDeleteForward: () => void
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

//#region Hook
export function useComboboxState({
	options,
	placeholder: _placeholder = '',
	defaultValue,
	visibleOptionCount = 5,
	onChange,
	onSelect,
}: IUseComboboxStateProps): IComboboxState {
	const [state, dispatch] = useReducer(
		comboboxReducer,
		{ options, defaultValue, visibleOptionCount },
		createDefaultComboboxState
	)

	// Reset state when options change
	const [lastOptions, setLastOptions] = useState(options)

	if (options !== lastOptions && !isDeepStrictEqual(options, lastOptions)) {
		dispatch({
			type: 'reset',
			state: createDefaultComboboxState({
				options,
				defaultValue,
				visibleOptionCount,
			}),
		})
		setLastOptions(options)
	}

	const prevInputValueRef = useRef(state.inputValue)
	const prevSelectedValueRef = useRef(state.selectedValue)

	// onChange callback (input value changed)
	useEffect(() => {
		if (state.inputValue !== prevInputValueRef.current) {
			prevInputValueRef.current = state.inputValue
			onChange?.(state.inputValue)
		}
	}, [state.inputValue, onChange])

	// onSelect callback (selection changed)
	useEffect(() => {
		if (
			state.selectedValue !== undefined &&
			state.selectedValue !== prevSelectedValueRef.current
		) {
			prevSelectedValueRef.current = state.selectedValue
			onSelect?.(state.selectedValue)
		}
	}, [state.selectedValue, onSelect])

	const inputInsert = useCallback((text: string) => {
		dispatch({ type: 'input-insert', text })
	}, [])

	const inputDelete = useCallback(() => {
		dispatch({ type: 'input-delete' })
	}, [])

	const inputDeleteForward = useCallback(() => {
		dispatch({ type: 'input-delete-forward' })
	}, [])

	const cursorLeft = useCallback(() => {
		dispatch({ type: 'cursor-left' })
	}, [])

	const cursorRight = useCallback(() => {
		dispatch({ type: 'cursor-right' })
	}, [])

	const cursorStart = useCallback(() => {
		dispatch({ type: 'cursor-start' })
	}, [])

	const cursorEnd = useCallback(() => {
		dispatch({ type: 'cursor-end' })
	}, [])

	const focusNextOption = useCallback(() => {
		dispatch({ type: 'focus-next-option' })
	}, [])

	const focusPreviousOption = useCallback(() => {
		dispatch({ type: 'focus-previous-option' })
	}, [])

	const selectFocused = useCallback(() => {
		dispatch({ type: 'select-focused' })
	}, [])

	const autofillFocused = useCallback(() => {
		dispatch({ type: 'autofill-focused' })
	}, [])

	const close = useCallback(() => {
		dispatch({ type: 'close' })
	}, [])

	const visibleOptions = useMemo(() => {
		return state.filteredOptions.slice(state.viewportFrom, state.viewportTo)
	}, [state.filteredOptions, state.viewportFrom, state.viewportTo])

	return {
		inputValue: state.inputValue,
		cursorOffset: state.cursorOffset,
		isOpen: state.isOpen,
		focusedIndex: state.focusedIndex,
		selectedValue: state.selectedValue,
		filteredOptionsCount: state.filteredOptions.length,
		viewportFrom: state.viewportFrom,
		viewportTo: state.viewportTo,
		visibleOptions,
		inputInsert,
		inputDelete,
		inputDeleteForward,
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
//#endregion Hook
