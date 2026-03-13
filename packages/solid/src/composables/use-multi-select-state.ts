import { isDeepStrictEqual } from 'node:util'
import { createSignal, createMemo, createEffect, on } from 'solid-js'
import { OptionMap, type Option } from '@wolfie/shared'

//#region Types
type State = {
	/**
	 * Map where key is option's value and value is option's index.
	 */
	optionMap: OptionMap

	/**
	 * Number of visible options.
	 */
	visibleOptionCount: number

	/**
	 * Value of the currently focused option.
	 */
	focusedValue: string | undefined

	/**
	 * Index of the first visible option.
	 */
	visibleFromIndex: number

	/**
	 * Index of the last visible option.
	 */
	visibleToIndex: number

	/**
	 * Values of previously selected options.
	 */
	previousValue: string[]

	/**
	 * Values of selected options.
	 */
	value: string[]
}

export type UseMultiSelectStateProps = {
	/**
	 * Number of visible options.
	 *
	 * @default 5
	 */
	visibleOptionCount?: number

	/**
	 * Options.
	 */
	options: Option[]

	/**
	 * Controlled value accessor. When provided, component reflects this value.
	 */
	value?: () => string[] | undefined

	/**
	 * Initially selected option values (uncontrolled mode).
	 */
	defaultValue?: string[]

	/**
	 * Callback for selecting options.
	 */
	onChange?: (value: string[]) => void

	/**
	 * Callback when user presses enter.
	 * First argument is an array of selected option values.
	 */
	onSubmit?: (value: string[]) => void
}

export type MultiSelectState = {
	/**
	 * Value of the currently focused option.
	 */
	focusedValue: () => string | undefined

	/**
	 * Index of the first visible option.
	 */
	visibleFromIndex: () => number

	/**
	 * Index of the last visible option.
	 */
	visibleToIndex: () => number

	/**
	 * Values of selected options.
	 */
	value: () => string[]

	/**
	 * Visible options.
	 */
	visibleOptions: () => Array<Option & { index: number }>

	/**
	 * Focus next option and scroll the list down, if needed.
	 */
	focusNextOption: () => void

	/**
	 * Focus previous option and scroll the list up, if needed.
	 */
	focusPreviousOption: () => void

	/**
	 * Toggle currently focused option.
	 */
	toggleFocusedOption: () => void

	/**
	 * Trigger `onSubmit` callback.
	 */
	submit: () => void
}
//#endregion Types

//#region State Factory
const createDefaultState = ({
	visibleOptionCount: customVisibleOptionCount,
	defaultValue,
	options,
}: Pick<
	UseMultiSelectStateProps,
	'visibleOptionCount' | 'defaultValue' | 'options'
>): State => {
	const visibleOptionCount =
		typeof customVisibleOptionCount === 'number'
			? Math.min(customVisibleOptionCount, options.length)
			: options.length

	const optionMap = new OptionMap(options)
	const value = defaultValue ?? []

	return {
		optionMap,
		visibleOptionCount,
		focusedValue: optionMap.first?.value,
		visibleFromIndex: 0,
		visibleToIndex: visibleOptionCount,
		previousValue: value,
		value,
	}
}
//#endregion State Factory

//#region Composable
export const useMultiSelectState = ({
	visibleOptionCount = 5,
	options,
	value: controlledValue,
	defaultValue,
	onChange,
	onSubmit,
}: UseMultiSelectStateProps): MultiSelectState => {
	// Use controlled value if provided, otherwise use defaultValue
	const initialValue = controlledValue?.() ?? defaultValue
	const initialState = createDefaultState({
		visibleOptionCount,
		defaultValue: initialValue,
		options,
	})

	const [optionMap, setOptionMap] = createSignal(initialState.optionMap)
	const [visibleCount, setVisibleCount] = createSignal(
		initialState.visibleOptionCount
	)
	const [focusedValue, setFocusedValue] = createSignal(
		initialState.focusedValue
	)
	const [visibleFromIndex, setVisibleFromIndex] = createSignal(
		initialState.visibleFromIndex
	)
	const [visibleToIndex, setVisibleToIndex] = createSignal(
		initialState.visibleToIndex
	)
	const [, setPreviousValue] = createSignal(initialState.previousValue)
	const [internalValue, setInternalValue] = createSignal(initialState.value)

	// Controlled mode: derive value from prop; uncontrolled: use internal state
	const value = createMemo(() => controlledValue?.() ?? internalValue())

	const [lastOptions, setLastOptions] = createSignal(options)

	// Watch for options changes
	createEffect(
		on(
			() => JSON.stringify(options),
			() => {
				if (!isDeepStrictEqual(options, lastOptions())) {
					const newState = createDefaultState({
						visibleOptionCount,
						defaultValue,
						options,
					})

					setOptionMap(newState.optionMap)
					setVisibleCount(newState.visibleOptionCount)
					setFocusedValue(newState.focusedValue)
					setVisibleFromIndex(newState.visibleFromIndex)
					setVisibleToIndex(newState.visibleToIndex)
					setPreviousValue(newState.previousValue)
					setInternalValue(newState.value)

					setLastOptions(options)
				}
			},
			{ defer: true }
		)
	)

	const focusNextOption = () => {
		if (!focusedValue()) {
			return
		}

		const item = optionMap().get(focusedValue()!)
		if (!item) {
			return
		}

		const next = item.next
		if (!next) {
			return
		}

		const needsToScroll = next.index >= visibleToIndex()

		if (!needsToScroll) {
			setFocusedValue(next.value)
			return
		}

		const nextVisibleToIndex = Math.min(optionMap().size, visibleToIndex() + 1)
		const nextVisibleFromIndex = nextVisibleToIndex - visibleCount()

		setFocusedValue(next.value)
		setVisibleFromIndex(nextVisibleFromIndex)
		setVisibleToIndex(nextVisibleToIndex)
	}

	const focusPreviousOption = () => {
		if (!focusedValue()) {
			return
		}

		const item = optionMap().get(focusedValue()!)
		if (!item) {
			return
		}

		const previous = item.previous
		if (!previous) {
			return
		}

		const needsToScroll = previous.index <= visibleFromIndex()

		if (!needsToScroll) {
			setFocusedValue(previous.value)
			return
		}

		const nextVisibleFromIndex = Math.max(0, visibleFromIndex() - 1)
		const nextVisibleToIndex = nextVisibleFromIndex + visibleCount()

		setFocusedValue(previous.value)
		setVisibleFromIndex(nextVisibleFromIndex)
		setVisibleToIndex(nextVisibleToIndex)
	}

	const toggleFocusedOption = () => {
		if (!focusedValue()) {
			return
		}

		if (internalValue().includes(focusedValue()!)) {
			const newVal = new Set(internalValue())
			newVal.delete(focusedValue()!)
			setPreviousValue(internalValue())
			setInternalValue([...newVal])
		} else {
			setPreviousValue(internalValue())
			setInternalValue((v) => [...v, focusedValue()!])
		}
	}

	const submit = () => {
		onSubmit?.(value())
	}

	const visibleOptions = createMemo(() =>
		options
			.map((option, index) => ({ ...option, index }))
			.slice(visibleFromIndex(), visibleToIndex())
	)

	createEffect(
		on(
			internalValue,
			(newValue, prevValue) => {
				if (!isDeepStrictEqual(prevValue, newValue)) {
					onChange?.(newValue)
				}
			},
			{ defer: true }
		)
	)

	return {
		focusedValue,
		visibleFromIndex,
		visibleToIndex,
		value,
		visibleOptions,
		focusNextOption,
		focusPreviousOption,
		toggleFocusedOption,
		submit,
	}
}
//#endregion Composable
