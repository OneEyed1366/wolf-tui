import { fuzzyFilter } from '../lib/fuzzy-match'
import type { IFuzzyFilterResult } from '../lib/fuzzy-match'
import type { Option } from '../types'

//#region Types
export type ComboboxState = {
	inputValue: string
	cursorOffset: number
	previousInputValue: string
	isOpen: boolean
	filteredOptions: Array<IFuzzyFilterResult<Option>>
	focusedIndex: number
	previousSelectedValue: string | undefined
	selectedValue: string | undefined
	options: Option[]
	visibleOptionCount: number
	viewportFrom: number
	viewportTo: number
	isLoading: boolean
	error: string | undefined
}

export type ComboboxAction =
	| { type: 'input-insert'; text: string }
	| { type: 'input-delete' }
	| { type: 'input-delete-forward' }
	| { type: 'cursor-left' }
	| { type: 'cursor-right' }
	| { type: 'cursor-start' }
	| { type: 'cursor-end' }
	| { type: 'focus-next-option' }
	| { type: 'focus-previous-option' }
	| { type: 'select-focused' }
	| { type: 'autofill-focused' }
	| { type: 'close' }
	| { type: 'reset'; state: ComboboxState }
	| { type: 'sync-options'; options: Option[] }
	| { type: 'set-loading'; isLoading: boolean }
	| { type: 'set-error'; error: string | undefined }
	| { type: 'set-filtered-options'; options: Option[] }
//#endregion Types

//#region Helpers
function refilter(state: ComboboxState): ComboboxState {
	const filteredOptions = fuzzyFilter(state.inputValue, state.options)
	const visibleCount = Math.min(
		state.visibleOptionCount,
		filteredOptions.length
	)

	return {
		...state,
		filteredOptions,
		focusedIndex: filteredOptions.length > 0 ? 0 : -1,
		viewportFrom: 0,
		viewportTo: visibleCount,
	}
}

function clampViewport(
	focusedIndex: number,
	viewportFrom: number,
	viewportTo: number,
	visibleOptionCount: number,
	totalOptions: number
): { viewportFrom: number; viewportTo: number } {
	if (focusedIndex < 0) {
		return { viewportFrom, viewportTo }
	}

	if (focusedIndex >= viewportTo) {
		const nextTo = Math.min(totalOptions, focusedIndex + 1)
		const nextFrom = nextTo - visibleOptionCount

		return { viewportFrom: Math.max(0, nextFrom), viewportTo: nextTo }
	}

	if (focusedIndex < viewportFrom) {
		const nextFrom = Math.max(0, focusedIndex)
		const nextTo = nextFrom + visibleOptionCount

		return {
			viewportFrom: nextFrom,
			viewportTo: Math.min(totalOptions, nextTo),
		}
	}

	return { viewportFrom, viewportTo }
}
//#endregion Helpers

//#region Reducer
export function comboboxReducer(
	state: ComboboxState,
	action: ComboboxAction
): ComboboxState {
	switch (action.type) {
		case 'input-insert': {
			const newValue =
				state.inputValue.slice(0, state.cursorOffset) +
				action.text +
				state.inputValue.slice(state.cursorOffset)

			return refilter({
				...state,
				previousInputValue: state.inputValue,
				inputValue: newValue,
				cursorOffset: state.cursorOffset + action.text.length,
				isOpen: true,
				selectedValue: undefined,
				error: undefined,
			})
		}

		case 'input-delete': {
			if (state.cursorOffset === 0) {
				return state
			}

			const newCursorOffset = state.cursorOffset - 1
			const newValue =
				state.inputValue.slice(0, newCursorOffset) +
				state.inputValue.slice(newCursorOffset + 1)

			return refilter({
				...state,
				previousInputValue: state.inputValue,
				inputValue: newValue,
				cursorOffset: newCursorOffset,
				isOpen: newValue.length > 0,
				selectedValue: undefined,
				error: undefined,
			})
		}

		case 'input-delete-forward': {
			if (state.cursorOffset >= state.inputValue.length) {
				return state
			}

			const newValue =
				state.inputValue.slice(0, state.cursorOffset) +
				state.inputValue.slice(state.cursorOffset + 1)

			return refilter({
				...state,
				previousInputValue: state.inputValue,
				inputValue: newValue,
				isOpen: newValue.length > 0,
				selectedValue: undefined,
				error: undefined,
			})
		}

		case 'cursor-left': {
			return {
				...state,
				cursorOffset: Math.max(0, state.cursorOffset - 1),
			}
		}

		case 'cursor-right': {
			return {
				...state,
				cursorOffset: Math.min(state.inputValue.length, state.cursorOffset + 1),
			}
		}

		case 'cursor-start': {
			return {
				...state,
				cursorOffset: 0,
			}
		}

		case 'cursor-end': {
			return {
				...state,
				cursorOffset: state.inputValue.length,
			}
		}

		case 'focus-next-option': {
			if (!state.isOpen) return state
			if (state.filteredOptions.length === 0) {
				return state
			}

			const nextIndex = Math.min(
				state.focusedIndex + 1,
				state.filteredOptions.length - 1
			)

			const viewport = clampViewport(
				nextIndex,
				state.viewportFrom,
				state.viewportTo,
				state.visibleOptionCount,
				state.filteredOptions.length
			)

			return {
				...state,
				focusedIndex: nextIndex,
				isOpen: true,
				viewportFrom: viewport.viewportFrom,
				viewportTo: viewport.viewportTo,
			}
		}

		case 'focus-previous-option': {
			if (!state.isOpen) return state

			const nextIndex = state.focusedIndex - 1

			if (nextIndex < -1) {
				return state
			}

			const viewport = clampViewport(
				nextIndex,
				state.viewportFrom,
				state.viewportTo,
				state.visibleOptionCount,
				state.filteredOptions.length
			)

			return {
				...state,
				focusedIndex: nextIndex,
				viewportFrom: viewport.viewportFrom,
				viewportTo: viewport.viewportTo,
			}
		}

		case 'select-focused': {
			if (
				state.focusedIndex < 0 ||
				state.focusedIndex >= state.filteredOptions.length
			) {
				return state
			}

			const focused = state.filteredOptions[state.focusedIndex]!
			const label = focused.option.label

			return {
				...state,
				previousSelectedValue: state.selectedValue,
				selectedValue: focused.option.value,
				inputValue: label,
				cursorOffset: label.length,
				isOpen: false,
			}
		}

		case 'autofill-focused': {
			if (
				state.focusedIndex < 0 ||
				state.focusedIndex >= state.filteredOptions.length
			) {
				return state
			}

			const focused = state.filteredOptions[state.focusedIndex]!
			const label = focused.option.label

			return refilter({
				...state,
				previousInputValue: state.inputValue,
				inputValue: label,
				cursorOffset: label.length,
			})
		}

		case 'close': {
			return {
				...state,
				isOpen: false,
				inputValue: '',
				cursorOffset: 0,
				focusedIndex: -1,
			}
		}

		case 'reset': {
			return action.state
		}

		case 'sync-options': {
			return refilter({
				...state,
				options: action.options,
			})
		}

		case 'set-loading': {
			return {
				...state,
				isLoading: action.isLoading,
			}
		}

		case 'set-error': {
			return {
				...state,
				error: action.error,
			}
		}

		case 'set-filtered-options': {
			const filteredOptions = fuzzyFilter(state.inputValue, action.options)
			const visibleCount = Math.min(
				state.visibleOptionCount,
				filteredOptions.length
			)

			return {
				...state,
				filteredOptions,
				focusedIndex: filteredOptions.length > 0 ? 0 : -1,
				viewportFrom: 0,
				viewportTo: visibleCount,
			}
		}

		default:
			return state
	}
}
//#endregion Reducer

//#region Factory
export function createDefaultComboboxState(options: {
	options: Option[]
	defaultValue?: string
	visibleOptionCount?: number
}): ComboboxState {
	const visibleOptionCount =
		typeof options.visibleOptionCount === 'number'
			? Math.min(options.visibleOptionCount, options.options.length)
			: options.options.length

	const defaultOption = options.defaultValue
		? options.options.find((o) => o.value === options.defaultValue)
		: undefined

	const inputValue = defaultOption ? defaultOption.label : ''
	const filteredOptions = fuzzyFilter(inputValue, options.options)

	return {
		inputValue,
		cursorOffset: inputValue.length,
		previousInputValue: inputValue,
		isOpen: false,
		filteredOptions,
		focusedIndex: filteredOptions.length > 0 ? 0 : -1,
		previousSelectedValue: options.defaultValue,
		selectedValue: options.defaultValue,
		options: options.options,
		visibleOptionCount,
		viewportFrom: 0,
		viewportTo: Math.min(visibleOptionCount, filteredOptions.length),
		isLoading: false,
		error: undefined,
	}
}
//#endregion Factory
