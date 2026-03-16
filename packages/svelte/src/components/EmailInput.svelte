<script lang="ts">
	import {
		renderTextInput,
		defaultTextInputTheme,
		type TextInputRenderTheme,
	} from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useEmailInputState } from '../composables/use-email-input-state.js'
	import { useEmailInput } from '../composables/use-email-input.js'

	let {
		isDisabled,
		placeholder,
		defaultValue,
		domains,
		onChange,
		onSubmit,
	}: {
		isDisabled?: boolean
		placeholder?: string
		defaultValue?: string
		domains?: string[]
		onChange?: (value: string) => void
		onSubmit?: (value: string) => void
	} = $props()

	const state = useEmailInputState({ defaultValue, domains, onChange, onSubmit })
	const { inputValue } = useEmailInput({
		isDisabled: () => isDisabled,
		placeholder,
		state,
	})

	const theme = useComponentTheme<TextInputRenderTheme>('EmailInput')
	const { styles } = theme ?? defaultTextInputTheme

	let wnode = $derived(renderTextInput({ inputValue: inputValue() }, { styles }))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
