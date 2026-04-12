import {
	defineComponent,
	toRef,
	type PropType,
	type DefineComponent,
} from 'vue'
import {
	renderCombobox,
	defaultComboboxTheme,
	type ComboboxRenderTheme,
	type Option,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { useComboboxState } from '../composables/use-combobox-state'
import { useCombobox } from '../composables/use-combobox'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface ComboboxProps {
	/**
	 * Options to display.
	 */
	options: Option[]

	/**
	 * Default selected value.
	 */
	defaultValue?: string

	/**
	 * Number of visible options in the dropdown.
	 *
	 * @default 5
	 */
	visibleOptionCount?: number

	/**
	 * Placeholder text when input is empty.
	 *
	 * @default 'Type to search...'
	 */
	placeholder?: string

	/**
	 * Text shown when no options match.
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
export const Combobox: DefineComponent<ComboboxProps> = defineComponent({
	name: 'Combobox',
	props: {
		options: {
			type: Array as PropType<Option[]>,
			required: true,
		},
		defaultValue: {
			type: String,
			default: undefined,
		},
		visibleOptionCount: {
			type: Number,
			default: 5,
		},
		placeholder: {
			type: String,
			default: 'Type to search...',
		},
		noMatchesText: {
			type: String,
			default: 'No matches',
		},
		isDisabled: {
			type: Boolean,
			default: false,
		},
		onChange: {
			type: Function as PropType<(value: string) => void>,
			default: undefined,
		},
		onSelect: {
			type: Function as PropType<(value: string) => void>,
			default: undefined,
		},
	},
	setup(props) {
		const state = useComboboxState({
			options: props.options,
			defaultValue: props.defaultValue,
			visibleOptionCount: props.visibleOptionCount,
			placeholder: props.placeholder,
			noMatchesText: props.noMatchesText,
			onChange: props.onChange,
			onSelect: props.onSelect,
		})

		useCombobox({ isDisabled: toRef(props, 'isDisabled'), state })

		const theme = useComponentTheme<ComboboxRenderTheme>('Combobox')
		const { styles, config } = theme ?? defaultComboboxTheme

		return () => {
			return wNodeToVue(
				renderCombobox(
					{
						inputValue: state.inputValue.value,
						cursorOffset: state.cursorOffset.value,
						isOpen: state.isOpen.value,
						visibleOptions: state.visibleOptions.value,
						selectedValue: state.selectedValue.value,
						isDisabled: props.isDisabled ?? false,
						placeholder: props.placeholder ?? 'Type to search...',
						noMatchesText: props.noMatchesText ?? 'No matches',
						hasScrollUp: state.hasScrollUp.value,
						hasScrollDown: state.hasScrollDown.value,
					},
					{ styles, config }
				)
			)
		}
	},
})
//#endregion Component

export {
	defaultComboboxTheme as comboboxTheme,
	type ComboboxRenderTheme as ComboboxTheme,
}
export type { ComboboxProps as Props, ComboboxProps as IProps }
