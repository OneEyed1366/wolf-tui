import { type JSX, splitProps, createMemo } from 'solid-js'
import {
	renderSelect,
	defaultSelectTheme,
	type SelectRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { useSelectState } from '../composables/use-select-state'
import { useSelect } from '../composables/use-select'
import { wNodeToSolid } from '../wnode/wnode-to-solid'
import type { Option } from '@wolfie/shared'

//#region Types
export interface ISelectProps {
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
export function Select(props: ISelectProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'visibleOptionCount',
		'highlightText',
		'options',
		'value',
		'defaultValue',
		'onChange',
	])

	const state = useSelectState({
		visibleOptionCount: local.visibleOptionCount,
		options: local.options,
		value: () => local.value, // WHY: accessor bc props are reactive in Solid
		defaultValue: local.defaultValue,
		onChange: local.onChange,
	})

	useSelect({ isDisabled: () => local.isDisabled, state })

	const theme = useComponentTheme<SelectRenderTheme>('Select')
	const { styles } = theme ?? defaultSelectTheme

	// All signal reads (state.visibleOptions(), state.focusedValue(), state.value())
	// are inside createMemo — recomputes on every navigation key press.
	const wnode = createMemo(() =>
		renderSelect(
			{
				visibleOptions: state.visibleOptions(),
				focusedValue: state.focusedValue(),
				value: state.value(),
				isDisabled: local.isDisabled ?? false,
				highlightText: local.highlightText,
			},
			{ styles }
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component

export {
	defaultSelectTheme as selectTheme,
	type SelectRenderTheme as SelectTheme,
}
