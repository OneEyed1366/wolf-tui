import { type JSX, splitProps, createMemo } from 'solid-js'
import { useEmailInputState } from '../composables/use-email-input-state'
import { useEmailInput } from '../composables/use-email-input'
import {
	renderTextInput,
	defaultTextInputTheme,
	type TextInputRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface IEmailInputProps {
	isDisabled?: boolean
	placeholder?: string
	defaultValue?: string
	domains?: string[]
	onChange?: (value: string) => void
	onSubmit?: (value: string) => void
}
//#endregion Types

//#region Component
export function EmailInput(props: IEmailInputProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'placeholder',
		'defaultValue',
		'domains',
		'onChange',
		'onSubmit',
	])

	const state = useEmailInputState({
		defaultValue: local.defaultValue,
		domains: local.domains,
		onChange: local.onChange,
		onSubmit: local.onSubmit,
	})

	const { inputValue } = useEmailInput({
		isDisabled: () => local.isDisabled,
		placeholder: local.placeholder,
		state,
	})

	const theme = useComponentTheme<TextInputRenderTheme>('EmailInput')
	const { styles } = theme ?? defaultTextInputTheme

	const wnode = createMemo(() =>
		renderTextInput({ inputValue: inputValue() }, { styles })
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component
