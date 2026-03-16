<script lang="ts">
	import {
		renderTextInput,
		defaultTextInputTheme,
		type TextInputRenderTheme,
	} from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { usePasswordInputState } from '../composables/use-password-input-state.js'
	import { usePasswordInput } from '../composables/use-password-input.js'

	let {
		isDisabled,
		placeholder,
		onChange,
		onSubmit,
	}: {
		isDisabled?: boolean
		placeholder?: string
		onChange?: (value: string) => void
		onSubmit?: (value: string) => void
	} = $props()

	const state = usePasswordInputState({ onChange, onSubmit })
	const { inputValue } = usePasswordInput({
		isDisabled: () => isDisabled,
		placeholder,
		state,
	})

	const theme = useComponentTheme<TextInputRenderTheme>('PasswordInput')
	const { styles } = theme ?? defaultTextInputTheme

	let wnode = $derived(renderTextInput({ inputValue: inputValue() }, { styles }))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
