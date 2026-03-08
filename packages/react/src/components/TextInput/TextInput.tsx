import {
	renderTextInput,
	defaultTextInputTheme,
	type TextInputRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../../theme/theme'
import { useTextInputState } from './use-text-input-state'
import { useTextInput } from './use-text-input'
import { wNodeToReact } from '../../wnode/wnode-to-react'

export type ITextInputProps = {
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

export function TextInput({
	isDisabled = false,
	defaultValue,
	placeholder = '',
	suggestions,
	onChange,
	onSubmit,
}: ITextInputProps) {
	const state = useTextInputState({
		defaultValue,
		suggestions,
		onChange,
		onSubmit,
	})

	const { inputValue } = useTextInput({
		isDisabled,
		placeholder,
		state,
	})

	const theme = useComponentTheme<TextInputRenderTheme>('TextInput')
	const { styles } = theme ?? defaultTextInputTheme

	return wNodeToReact(renderTextInput({ inputValue }, { styles }))
}
