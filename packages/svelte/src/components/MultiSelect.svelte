<script lang="ts">
	import {
		renderMultiSelect,
		defaultMultiSelectTheme,
		type MultiSelectRenderTheme,
		type Option,
	} from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useMultiSelectState } from '../composables/use-multi-select-state.js'
	import { useMultiSelect } from '../composables/use-multi-select.js'

	let {
		isDisabled,
		visibleOptionCount,
		options,
		value,
		defaultValue,
		onChange,
		onSubmit,
	}: {
		isDisabled?: boolean
		visibleOptionCount?: number
		options: Option[]
		value?: string[]
		defaultValue?: string[]
		onChange?: (value: string[]) => void
		onSubmit?: (value: string[]) => void
	} = $props()

	const state = useMultiSelectState({
		visibleOptionCount,
		options,
		value: () => value,
		defaultValue,
		onChange,
		onSubmit,
	})

	useMultiSelect({ isDisabled: () => isDisabled, state })

	const theme = useComponentTheme<MultiSelectRenderTheme>('MultiSelect')
	const { styles } = theme ?? defaultMultiSelectTheme

	let wnode = $derived(renderMultiSelect(
		{
			visibleOptions: state.visibleOptions(),
			focusedValue: state.focusedValue(),
			value: state.value(),
			isDisabled: isDisabled ?? false,
		},
		{ styles }
	))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
