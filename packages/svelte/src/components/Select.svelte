<script lang="ts">
	import {
		renderSelect,
		defaultSelectTheme,
		type SelectRenderTheme,
		type Option,
	} from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useSelectState } from '../composables/use-select-state.js'
	import { useSelect } from '../composables/use-select.js'

	let {
		isDisabled,
		visibleOptionCount,
		highlightText,
		options,
		value,
		defaultValue,
		onChange,
	}: {
		isDisabled?: boolean
		visibleOptionCount?: number
		highlightText?: string
		options: Option[]
		value?: string
		defaultValue?: string
		onChange?: (value: string) => void
	} = $props()

	const state = useSelectState({
		visibleOptionCount,
		options,
		value: () => value,
		defaultValue,
		onChange,
	})

	useSelect({ isDisabled: () => isDisabled, state })

	const theme = useComponentTheme<SelectRenderTheme>('Select')
	const { styles } = theme ?? defaultSelectTheme

	let wnode = $derived(renderSelect(
		{
			visibleOptions: state.visibleOptions(),
			focusedValue: state.focusedValue(),
			value: state.value(),
			isDisabled: isDisabled ?? false,
			highlightText,
		},
		{ styles }
	))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
