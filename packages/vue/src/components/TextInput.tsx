import { defineComponent, type PropType, type DefineComponent } from 'vue'
import { useComponentTheme } from '../theme'
import { useTextInputState } from '../composables/use-text-input-state'
import { useTextInput } from '../composables/use-text-input'
import {
	renderTextInput,
	defaultTextInputTheme,
	type TextInputRenderTheme,
} from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface TextInputProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Text to display when input is empty.
	 */
	placeholder?: string

	/**
	 * Default input value.
	 */
	defaultValue?: string

	/**
	 * Suggestions to autocomplete the input value.
	 */
	suggestions?: string[]

	/**
	 * Callback when input value changes.
	 */
	onChange?: (value: string) => void

	/**
	 * Callback when enter is pressed. First argument is input value.
	 */
	onSubmit?: (value: string) => void
}
//#endregion Types

//#region Component
export const TextInput: DefineComponent<TextInputProps> = defineComponent({
	name: 'TextInput',
	props: {
		isDisabled: {
			type: Boolean,
			default: false,
		},
		placeholder: {
			type: String,
			default: '',
		},
		defaultValue: {
			type: String,
			default: undefined,
		},
		suggestions: {
			type: Array as PropType<string[]>,
			default: undefined,
		},
		onChange: {
			type: Function as PropType<(value: string) => void>,
			default: undefined,
		},
		onSubmit: {
			type: Function as PropType<(value: string) => void>,
			default: undefined,
		},
	},
	setup(props) {
		const state = useTextInputState({
			defaultValue: props.defaultValue,
			suggestions: props.suggestions,
			onChange: props.onChange,
			onSubmit: props.onSubmit,
		})

		const { inputValue } = useTextInput({
			isDisabled: props.isDisabled,
			placeholder: props.placeholder,
			state,
		})

		const theme = useComponentTheme<TextInputRenderTheme>('TextInput')
		const { styles } = theme ?? defaultTextInputTheme

		return () => {
			return wNodeToVue(
				renderTextInput({ inputValue: inputValue.value }, { styles })
			)
		}
	},
})
//#endregion Component

export {
	defaultTextInputTheme as textInputTheme,
	type TextInputRenderTheme as TextInputTheme,
}
export type { TextInputProps as Props, TextInputProps as IProps }
