import {
	defineComponent,
	toRef,
	type PropType,
	type DefineComponent,
} from 'vue'
import {
	renderSelect,
	defaultSelectTheme,
	type SelectRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import type { Option } from '../types'
import { useSelectState } from '../composables/use-select-state'
import { useSelect } from '../composables/use-select'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface SelectProps {
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
export const Select: DefineComponent<SelectProps> = defineComponent({
	name: 'Select',
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
			type: String,
			default: undefined,
		},
		defaultValue: {
			type: String,
			default: undefined,
		},
		onChange: {
			type: Function as PropType<(value: string) => void>,
			default: undefined,
		},
	},
	setup(props) {
		const state = useSelectState({
			visibleOptionCount: props.visibleOptionCount,
			options: props.options,
			value: toRef(props, 'value'),
			defaultValue: props.defaultValue,
			onChange: props.onChange,
		})

		useSelect({ isDisabled: toRef(props, 'isDisabled'), state })

		const theme = useComponentTheme<SelectRenderTheme>('Select')
		const { styles } = theme ?? defaultSelectTheme

		return () => {
			return wNodeToVue(
				renderSelect(
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
	defaultSelectTheme as selectTheme,
	type SelectRenderTheme as SelectTheme,
}
export type { SelectProps as Props, SelectProps as IProps }
