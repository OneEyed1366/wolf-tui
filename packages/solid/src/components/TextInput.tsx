import { type JSX, splitProps, createMemo } from 'solid-js'
import { useTextInputState } from '../composables/use-text-input-state'
import { useTextInput } from '../composables/use-text-input'
import {
	renderTextInput,
	defaultTextInputTheme,
	type TextInputRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface ITextInputProps {
	isDisabled?: boolean
	placeholder?: string
	defaultValue?: string
	suggestions?: string[]
	onChange?: (value: string) => void
	onSubmit?: (value: string) => void
}
//#endregion Types

//#region Component
export function TextInput(props: ITextInputProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'placeholder',
		'defaultValue',
		'suggestions',
		'onChange',
		'onSubmit',
	])

	const state = useTextInputState({
		defaultValue: local.defaultValue,
		suggestions: local.suggestions,
		onChange: local.onChange,
		onSubmit: local.onSubmit,
	})

	const { inputValue } = useTextInput({
		isDisabled: () => local.isDisabled,
		placeholder: local.placeholder,
		state,
	})

	const theme = useComponentTheme<TextInputRenderTheme>('TextInput')
	const { styles } = theme ?? defaultTextInputTheme

	// inputValue() is a signal accessor — createMemo tracks it
	const wnode = createMemo(() =>
		renderTextInput({ inputValue: inputValue() }, { styles })
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component
