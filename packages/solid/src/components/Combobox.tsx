import { type JSX, splitProps, createMemo } from 'solid-js'
import {
	renderCombobox,
	defaultComboboxTheme,
	type ComboboxRenderTheme,
	type Option,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { useComboboxState } from '../composables/use-combobox-state'
import { useCombobox } from '../composables/use-combobox'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface IComboboxProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

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
//#endregion Types

//#region Component
export function Combobox(props: IComboboxProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'options',
		'defaultValue',
		'visibleOptionCount',
		'placeholder',
		'noMatchesText',
		'onChange',
		'onSelect',
	])

	const state = useComboboxState({
		options: local.options,
		defaultValue: local.defaultValue,
		visibleOptionCount: local.visibleOptionCount,
		placeholder: local.placeholder,
		noMatchesText: local.noMatchesText,
		onChange: local.onChange,
		onSelect: local.onSelect,
	})

	useCombobox({ isDisabled: () => local.isDisabled, state })

	const theme = useComponentTheme<ComboboxRenderTheme>('Combobox')
	const { styles, config } = theme ?? defaultComboboxTheme

	const wnode = createMemo(() =>
		renderCombobox(
			{
				inputValue: state.inputValue(),
				cursorOffset: state.cursorOffset(),
				isOpen: state.isOpen(),
				visibleOptions: state.visibleOptions(),
				selectedValue: state.selectedValue(),
				isDisabled: local.isDisabled ?? false,
				placeholder: state.placeholder,
				noMatchesText: state.noMatchesText,
				hasScrollUp: state.hasScrollUp(),
				hasScrollDown: state.hasScrollDown(),
			},
			{ styles, config }
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component

export {
	defaultComboboxTheme as comboboxTheme,
	type ComboboxRenderTheme as ComboboxTheme,
} from '@wolf-tui/shared'
