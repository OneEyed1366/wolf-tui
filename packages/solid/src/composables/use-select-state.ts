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
	 * Value of the previously selected option.
	 */
	previousValue: string | undefined

	/**
	 * Value of the selected option.
	 */
	value: string | undefined
}

export type UseSelectStateProps = {
	/**
	 * Number of items to display.
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
	value?: () => string | undefined

	/**
	 * Initially selected option's value (uncontrolled mode).
	 */
	defaultValue?: string

	/**
	 * Callback for selecting an option.
	 */
	onChange?: (value: string) => void
}

export type SelectState = {
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
	 * Value of the selected option.
	 */
	value: () => string | undefined

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
	 * Select currently focused option.
	 */
	selectFocusedOption: () => void
}
//#endregion Types

//#region State Factory
const createDefaultState = ({
	visibleOptionCount: customVisibleOptionCount,
	defaultValue,
	options,
}: Pick<
	UseSelectStateProps,
	'visibleOptionCount' | 'defaultValue' | 'options'
>): State => {
	const visibleOptionCount =
		typeof customVisibleOptionCount === 'number'
			? Math.min(customVisibleOptionCount, options.length)
			: options.length

	const optionMap = new OptionMap(options)

	return {
		optionMap,
		visibleOptionCount,
		focusedValue: optionMap.first?.value,
		visibleFromIndex: 0,
		visibleToIndex: visibleOptionCount,
		previousValue: defaultValue,
		value: defaultValue,
	}
}
//#endregion State Factory

//#region Composable
export const useSelectState = ({
	visibleOptionCount = 5,
	options,
	value: controlledValue,
	defaultValue,
	onChange,
}: UseSelectStateProps): SelectState => {
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

	// Sync focusedValue when controlled value changes
	createEffect(
		on(
			() => controlledValue?.(),
			(newValue) => {
				if (newValue !== undefined) {
					setFocusedValue(newValue)
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

	const selectFocusedOption = () => {
		setPreviousValue(internalValue())
		setInternalValue(focusedValue())
	}

	const visibleOptions = createMemo(() =>
		options
			.map((option, index) => ({ ...option, index }))
			.slice(visibleFromIndex(), visibleToIndex())
	)

	createEffect(
		on(
			internalValue,
			(newValue, oldValue) => {
				if (newValue && oldValue !== newValue) {
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
		selectFocusedOption,
	}
}
//#endregion Composable
