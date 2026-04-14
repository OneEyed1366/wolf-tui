import {
	renderCombobox,
	defaultComboboxTheme,
	type ComboboxRenderTheme,
	type ComboboxVisibleOption,
	type Option,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../../theme/theme'
import { useComboboxState } from './use-combobox-state'
import { useCombobox } from './use-combobox'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type IComboboxProps = {
	/**
	 * Options to filter and select from.
	 */
	options: Option[]

	/**
	 * Placeholder text shown when input is empty.
	 *
	 * @default 'Search...'
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
	 * Text shown when no options match the input.
	 *
	 * @default 'No matches'
	 */
	noMatchesText?: string

	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Callback when input value changes.
	 */
	onChange?: (value: string) => void

	/**
	 * Callback when an option is selected.
	 */
	onSelect?: (value: string) => void
}
//#endregion Types

//#region Component
export function Combobox({
	options,
	placeholder = 'Search...',
	defaultValue,
	visibleOptionCount = 5,
	noMatchesText = 'No matches',
	isDisabled = false,
	onChange,
	onSelect,
}: IComboboxProps) {
	const state = useComboboxState({
		options,
		placeholder,
		defaultValue,
		visibleOptionCount,
		onChange,
		onSelect,
	})

	useCombobox({ isDisabled, state })

	const theme = useComponentTheme<ComboboxRenderTheme>('Combobox')
	const resolvedTheme = theme ?? defaultComboboxTheme

	const visibleOptions: ComboboxVisibleOption[] = state.visibleOptions.map(
		(filtered, index) => ({
			label: filtered.option.label,
			value: filtered.option.value,
			matchRanges: filtered.matchRanges,
			isFocused: state.viewportFrom + index === state.focusedIndex,
		})
	)

	const hasScrollUp = state.viewportFrom > 0
	const hasScrollDown = state.viewportTo < state.filteredOptionsCount

	return wNodeToReact(
		renderCombobox(
			{
				inputValue: state.inputValue,
				cursorOffset: state.cursorOffset,
				isOpen: state.isOpen,
				visibleOptions,
				selectedValue: state.selectedValue,
				isDisabled,
				placeholder,
				noMatchesText,
				hasScrollUp,
				hasScrollDown,
			},
			resolvedTheme
		)
	)
}
//#endregion Component
