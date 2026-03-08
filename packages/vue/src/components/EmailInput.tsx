import { defineComponent, type PropType, type DefineComponent } from 'vue'
import { useComponentTheme } from '../theme'
import { useEmailInputState } from '../composables/use-email-input-state'
import { useEmailInput } from '../composables/use-email-input'
import {
	renderTextInput,
	defaultTextInputTheme,
	type TextInputRenderTheme,
} from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface EmailInputProps {
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
	 * Domains of email providers to autocomplete.
	 *
	 * @default ["aol.com", "gmail.com", "yahoo.com", "hotmail.com", "live.com", "outlook.com", "icloud.com", "hey.com"]
	 */
	domains?: string[]

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
export const EmailInput: DefineComponent<EmailInputProps> = defineComponent({
	name: 'EmailInput',
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
		domains: {
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
		const state = useEmailInputState({
			defaultValue: props.defaultValue,
			domains: props.domains,
			onChange: props.onChange,
			onSubmit: props.onSubmit,
		})

		const { inputValue } = useEmailInput({
			isDisabled: props.isDisabled,
			placeholder: props.placeholder,
			state,
		})

		const theme = useComponentTheme<TextInputRenderTheme>('EmailInput')
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
	defaultTextInputTheme as emailInputTheme,
	type TextInputRenderTheme as EmailInputTheme,
}
export type { EmailInputProps as Props, EmailInputProps as IProps }
