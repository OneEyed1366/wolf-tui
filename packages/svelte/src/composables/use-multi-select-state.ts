import { isDeepStrictEqual } from 'node:util'
import { OptionMap, type Option } from '@wolfie/shared'

//#region Types
type State = {
	optionMap: OptionMap
	visibleOptionCount: number
	focusedValue: string | undefined
	visibleFromIndex: number
	visibleToIndex: number
	previousValue: string[]
	value: string[]
}

export type UseMultiSelectStateProps = {
	visibleOptionCount?: number
	options: Option[]
	value?: () => string[] | undefined
	defaultValue?: string[]
	onChange?: (value: string[]) => void
	onSubmit?: (value: string[]) => void
}

export type MultiSelectState = {
	focusedValue: () => string | undefined
	visibleFromIndex: () => number
	visibleToIndex: () => number
	value: () => string[]
	visibleOptions: () => Array<Option & { index: number }>
	focusNextOption: () => void
	focusPreviousOption: () => void
	toggleFocusedOption: () => void
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
	const initialValue = controlledValue?.() ?? defaultValue
	const initialState = createDefaultState({
		visibleOptionCount,
		defaultValue: initialValue,
		options,
	})

	const _optionMap = initialState.optionMap
	const _visibleCount = initialState.visibleOptionCount
	let _focusedValue = initialState.focusedValue
	let _visibleFromIndex = initialState.visibleFromIndex
	let _visibleToIndex = initialState.visibleToIndex
	let _internalValue = initialState.value

	const value = () => controlledValue?.() ?? _internalValue

	const focusedValue = () => _focusedValue
	const visibleFromIndex = () => _visibleFromIndex
	const visibleToIndex = () => _visibleToIndex

	const visibleOptions = () =>
		options
			.map((option, index) => ({ ...option, index }))
			.slice(_visibleFromIndex, _visibleToIndex)

	const focusNextOption = () => {
		if (!_focusedValue) return

		const item = _optionMap.get(_focusedValue)
		if (!item) return

		const next = item.next
		if (!next) return

		const needsToScroll = next.index >= _visibleToIndex

		_focusedValue = next.value

		if (needsToScroll) {
			_visibleToIndex = Math.min(_optionMap.size, _visibleToIndex + 1)
			_visibleFromIndex = _visibleToIndex - _visibleCount
		}
	}

	const focusPreviousOption = () => {
		if (!_focusedValue) return

		const item = _optionMap.get(_focusedValue)
		if (!item) return

		const previous = item.previous
		if (!previous) return

		const needsToScroll = previous.index <= _visibleFromIndex

		_focusedValue = previous.value

		if (needsToScroll) {
			_visibleFromIndex = Math.max(0, _visibleFromIndex - 1)
			_visibleToIndex = _visibleFromIndex + _visibleCount
		}
	}

	const toggleFocusedOption = () => {
		if (!_focusedValue) return

		const oldValue = _internalValue
		if (_internalValue.includes(_focusedValue)) {
			const newVal = new Set(_internalValue)
			newVal.delete(_focusedValue)
			_internalValue = [...newVal]
		} else {
			_internalValue = [..._internalValue, _focusedValue]
		}

		if (!isDeepStrictEqual(oldValue, _internalValue)) {
			onChange?.(_internalValue)
		}
	}

	const submit = () => {
		onSubmit?.(value())
	}

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
