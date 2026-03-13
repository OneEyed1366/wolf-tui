import {
	renderTextInput,
	defaultTextInputTheme,
	type TextInputRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../../theme/theme'
import { useEmailInputState } from './use-email-input-state'
import { useEmailInput } from './use-email-input'
import { wNodeToReact } from '../../wnode/wnode-to-react'

export type EmailInputProps = {
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

export function EmailInput({
	isDisabled = false,
	defaultValue,
	placeholder = '',
	domains,
	onChange,
	onSubmit,
}: EmailInputProps) {
	const state = useEmailInputState({
		defaultValue,
		domains,
		onChange,
		onSubmit,
	})

	const { inputValue } = useEmailInput({
		isDisabled,
		placeholder,
		state,
	})

	const theme = useComponentTheme<TextInputRenderTheme>('EmailInput')
	const { styles } = theme ?? defaultTextInputTheme

	return wNodeToReact(renderTextInput({ inputValue }, { styles }))
}
