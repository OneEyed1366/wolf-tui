import { defineComponent, type PropType, type DefineComponent } from 'vue'
import { useComponentTheme } from '../theme'
import { usePasswordInputState } from '../composables/use-password-input-state'
import { usePasswordInput } from '../composables/use-password-input'
import {
	renderTextInput,
	defaultTextInputTheme,
	type TextInputRenderTheme,
} from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface PasswordInputProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Text to display when `value` is empty.
	 */
	placeholder?: string

	/**
	 * Callback when value updates.
	 */
	onChange?: (value: string) => void

	/**
	 * Callback when `Enter` is pressed. First argument is a value of the input.
	 */
	onSubmit?: (value: string) => void
}
//#endregion Types

//#region Component
export const PasswordInput: DefineComponent<PasswordInputProps> =
	defineComponent({
		name: 'PasswordInput',
		props: {
			isDisabled: {
				type: Boolean,
				default: false,
			},
			placeholder: {
				type: String,
				default: '',
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
			const state = usePasswordInputState({
				onChange: props.onChange,
				onSubmit: props.onSubmit,
			})

			const { inputValue } = usePasswordInput({
				isDisabled: props.isDisabled,
				placeholder: props.placeholder,
				state,
			})

			const theme = useComponentTheme<TextInputRenderTheme>('PasswordInput')
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
	defaultTextInputTheme as passwordInputTheme,
	type TextInputRenderTheme as PasswordInputTheme,
}
export type { PasswordInputProps as Props, PasswordInputProps as IProps }
