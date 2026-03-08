import {
	defineComponent,
	toRef,
	type PropType,
	type DefineComponent,
} from 'vue'
import {
	renderMultiSelect,
	defaultMultiSelectTheme,
	type MultiSelectRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import type { Option } from '../types'
import { useMultiSelectState } from '../composables/use-multi-select-state'
import { useMultiSelect } from '../composables/use-multi-select'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface MultiSelectProps {
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
export const MultiSelect: DefineComponent<MultiSelectProps> = defineComponent({
	name: 'MultiSelect',
	props: {
		isDisabled: {
			type: Boolean,
			default: false,
		},
		visibleOptionCount: {
			type: Number,
			default: 5,
		},
		highlightText: {
			type: String,
			default: undefined,
		},
		options: {
			type: Array as PropType<Option[]>,
			required: true,
		},
		value: {
			type: Array as PropType<string[]>,
			default: undefined,
		},
		defaultValue: {
			type: Array as PropType<string[]>,
			default: undefined,
		},
		onChange: {
			type: Function as PropType<(value: string[]) => void>,
			default: undefined,
		},
		onSubmit: {
			type: Function as PropType<(value: string[]) => void>,
			default: undefined,
		},
	},
	setup(props) {
		const state = useMultiSelectState({
			visibleOptionCount: props.visibleOptionCount,
			options: props.options,
			value: toRef(props, 'value'),
			defaultValue: props.defaultValue,
			onChange: props.onChange,
			onSubmit: props.onSubmit,
		})

		useMultiSelect({ isDisabled: toRef(props, 'isDisabled'), state })

		const theme = useComponentTheme<MultiSelectRenderTheme>('MultiSelect')
		const { styles } = theme ?? defaultMultiSelectTheme

		return () => {
			return wNodeToVue(
				renderMultiSelect(
					{
						visibleOptions: state.visibleOptions.value,
						focusedValue: state.focusedValue.value,
						value: state.value.value,
						isDisabled: props.isDisabled ?? false,
						highlightText: props.highlightText,
					},
					{ styles }
				)
			)
		}
	},
})
//#endregion Component

export {
	defaultMultiSelectTheme as multiSelectTheme,
	type MultiSelectRenderTheme as MultiSelectTheme,
}
export type { MultiSelectProps as Props, MultiSelectProps as IProps }
