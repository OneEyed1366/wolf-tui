import {
	renderMultiSelect,
	defaultMultiSelectTheme,
	type MultiSelectRenderTheme,
} from '@wolfie/shared'
import type { Option } from '@wolfie/shared'
import { useComponentTheme } from '../../theme/theme'
import { useMultiSelectState } from './use-multi-select-state'
import { useMultiSelect } from './use-multi-select'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type IMultiSelectProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Number of visible options.
	 *
	 * @default 5
	 */
	visibleOptionCount?: number

	/**
	 * Highlight text in option labels.
	 * Useful for filtering options.
	 */
	highlightText?: string

	/**
	 * Options.
	 */
	options: Option[]

	/**
	 * Controlled value. When provided, component always reflects this value.
	 */
	value?: string[]

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
//#endregion Types

//#region Component
export function MultiSelect({
	isDisabled = false,
	visibleOptionCount = 5,
	highlightText,
	options,
	value,
	defaultValue,
	onChange,
	onSubmit,
}: IMultiSelectProps) {
	const state = useMultiSelectState({
		visibleOptionCount,
		options,
		value,
		defaultValue,
		onChange,
		onSubmit,
	})

	useMultiSelect({ isDisabled, state })

	const theme = useComponentTheme<MultiSelectRenderTheme>('MultiSelect')
	const { styles } = theme ?? defaultMultiSelectTheme

	return wNodeToReact(
		renderMultiSelect(
			{
				visibleOptions: state.visibleOptions,
				focusedValue: state.focusedValue,
				value: state.value,
				isDisabled,
				highlightText,
			},
			{ styles }
		)
	)
}
//#endregion Component
