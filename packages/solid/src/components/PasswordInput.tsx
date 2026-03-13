import { type JSX, splitProps, createMemo } from 'solid-js'
import { usePasswordInputState } from '../composables/use-password-input-state'
import { usePasswordInput } from '../composables/use-password-input'
import {
	renderTextInput,
	defaultTextInputTheme,
	type TextInputRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface IPasswordInputProps {
	isDisabled?: boolean
	placeholder?: string
	onChange?: (value: string) => void
	onSubmit?: (value: string) => void
}
//#endregion Types

//#region Component
export function PasswordInput(props: IPasswordInputProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'placeholder',
		'onChange',
		'onSubmit',
	])

	const state = usePasswordInputState({
		onChange: local.onChange,
		onSubmit: local.onSubmit,
	})

	const { inputValue } = usePasswordInput({
		isDisabled: () => local.isDisabled,
		placeholder: local.placeholder,
		state,
	})

	const theme = useComponentTheme<TextInputRenderTheme>('PasswordInput')
	const { styles } = theme ?? defaultTextInputTheme

	const wnode = createMemo(() =>
		renderTextInput({ inputValue: inputValue() }, { styles })
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component
