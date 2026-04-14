<!-- #region Script -->
<script lang="ts">
	import {
		renderCombobox,
		defaultComboboxTheme,
		type ComboboxRenderTheme,
		type Option,
	} from '@wolf-tui/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useComboboxState } from '../composables/use-combobox-state.svelte.js'
	import { useCombobox } from '../composables/use-combobox.js'

	let {
		options,
		defaultValue,
		visibleOptionCount = 5,
		placeholder = 'Search...',
		noMatchesText = 'No matches',
		isDisabled = false,
		onChange,
		onSelect,
	}: {
		options: Option[]
		defaultValue?: string
		visibleOptionCount?: number
		placeholder?: string
		noMatchesText?: string
		isDisabled?: boolean
		onChange?: (inputValue: string) => void
		onSelect?: (value: string) => void
	} = $props()

	const state = useComboboxState({
		options: () => options,
		defaultValue,
		visibleOptionCount,
		placeholder,
		noMatchesText,
		onChange,
		onSelect,
	})

	useCombobox({ isDisabled: () => isDisabled, state })

	const theme = useComponentTheme<ComboboxRenderTheme>('Combobox')
	const { styles, config } = theme ?? defaultComboboxTheme

	let wnode = $derived(renderCombobox(
		{
			inputValue: state.inputValue(),
			cursorOffset: state.cursorOffset(),
			isOpen: state.isOpen(),
			visibleOptions: state.visibleOptions(),
			selectedValue: state.selectedValue(),
			isDisabled,
			placeholder,
			noMatchesText,
			hasScrollUp: state.hasScrollUp(),
			hasScrollDown: state.hasScrollDown(),
		},
		{ styles, config }
	))
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<wolfie-box use:mountWNode={wnode}></wolfie-box>
<!-- #endregion Template -->
