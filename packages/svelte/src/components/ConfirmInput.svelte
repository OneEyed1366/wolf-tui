<script lang="ts">
	import {
		renderConfirmInput,
		defaultConfirmInputTheme,
		type ConfirmInputRenderTheme,
	} from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useInput } from '../composables/use-input.js'

	let {
		isDisabled,
		defaultChoice = 'confirm',
		submitOnEnter = true,
		onConfirm,
		onCancel,
	}: {
		isDisabled?: boolean
		defaultChoice?: 'confirm' | 'cancel'
		submitOnEnter?: boolean
		onConfirm: () => void
		onCancel: () => void
	} = $props()

	const isActive = () => !(isDisabled ?? false)

	useInput(
		(input, key) => {
			if (input.toLowerCase() === 'y') {
				onConfirm()
			}
			if (input.toLowerCase() === 'n') {
				onCancel()
			}
			if (key.return && submitOnEnter) {
				if (defaultChoice === 'confirm') {
					onConfirm()
				} else {
					onCancel()
				}
			}
		},
		{ isActive }
	)

	const theme = useComponentTheme<ConfirmInputRenderTheme>('ConfirmInput')
	const { styles } = theme ?? defaultConfirmInputTheme

	let wnode = $derived(renderConfirmInput(
		{
			defaultChoice,
			isDisabled: isDisabled ?? false,
		},
		{ styles }
	))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
