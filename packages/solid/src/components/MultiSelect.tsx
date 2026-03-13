import { type JSX, splitProps, createMemo } from 'solid-js'
import {
	renderMultiSelect,
	defaultMultiSelectTheme,
	type MultiSelectRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { useMultiSelectState } from '../composables/use-multi-select-state'
import { useMultiSelect } from '../composables/use-multi-select'
import { wNodeToSolid } from '../wnode/wnode-to-solid'
import type { Option } from '@wolfie/shared'

//#region Types
export interface IMultiSelectProps {
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
export function MultiSelect(props: IMultiSelectProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'visibleOptionCount',
		'options',
		'value',
		'defaultValue',
		'onChange',
		'onSubmit',
	])

	const state = useMultiSelectState({
		visibleOptionCount: local.visibleOptionCount,
		options: local.options,
		value: () => local.value, // WHY: accessor bc props are reactive in Solid
		defaultValue: local.defaultValue,
		onChange: local.onChange,
		onSubmit: local.onSubmit,
	})

	useMultiSelect({ isDisabled: () => local.isDisabled, state })

	const theme = useComponentTheme<MultiSelectRenderTheme>('MultiSelect')
	const { styles } = theme ?? defaultMultiSelectTheme

	const wnode = createMemo(() =>
		renderMultiSelect(
			{
				visibleOptions: state.visibleOptions(),
				focusedValue: state.focusedValue(),
				value: state.value(),
				isDisabled: local.isDisabled ?? false,
			},
			{ styles }
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component

export {
	defaultMultiSelectTheme as multiSelectTheme,
	type MultiSelectRenderTheme as MultiSelectTheme,
}
