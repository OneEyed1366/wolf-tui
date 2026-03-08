import {
	renderSelect,
	defaultSelectTheme,
	type SelectRenderTheme,
} from '@wolfie/shared'
import type { Option } from '@wolfie/shared'
import { useComponentTheme } from '../../theme/theme'
import { useSelectState } from './use-select-state'
import { useSelect } from './use-select'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type ISelectProps = {
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
	 */
	highlightText?: string

	/**
	 * Options.
	 */
	options: Option[]

	/**
	 * Controlled value. When provided, component always reflects this value.
	 */
	value?: string

	/**
	 * Default value (uncontrolled mode).
	 */
	defaultValue?: string

	/**
	 * Callback when selected option changes.
	 */
	onChange?: (value: string) => void
}
//#endregion Types

//#region Component
export function Select({
	isDisabled = false,
	visibleOptionCount = 5,
	highlightText,
	options,
	value,
	defaultValue,
	onChange,
}: ISelectProps) {
	const state = useSelectState({
		visibleOptionCount,
		options,
		value,
		defaultValue,
		onChange,
	})

	useSelect({ isDisabled, state })

	const theme = useComponentTheme<SelectRenderTheme>('Select')
	const { styles } = theme ?? defaultSelectTheme

	return wNodeToReact(
		renderSelect(
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
