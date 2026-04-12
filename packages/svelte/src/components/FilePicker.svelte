<!-- #region Script -->
<script lang="ts">
	import {
		renderFilePicker,
		defaultFilePickerTheme,
		type FilePickerRenderTheme,
		type FileTypeFilter,
	} from '@wolf-tui/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useFilePickerState } from '../composables/use-file-picker-state.svelte.js'
	import { useFilePicker } from '../composables/use-file-picker.js'

	let {
		initialPath = '.',
		multiSelect = false,
		fileTypes = 'all',
		showHidden = false,
		showDetails = false,
		maxHeight = 10,
		isDisabled = false,
		onSelect,
		onCancel,
		onDirectoryChange,
		onError,
	}: {
		initialPath?: string
		multiSelect?: boolean
		fileTypes?: FileTypeFilter
		showHidden?: boolean
		showDetails?: boolean
		maxHeight?: number
		isDisabled?: boolean
		onSelect?: (paths: string[]) => void
		onCancel?: () => void
		onDirectoryChange?: (path: string) => void
		onError?: (error: string) => void
	} = $props()

	const state = useFilePickerState({
		initialPath,
		multiSelect,
		fileTypes,
		showHidden,
		showDetails,
		maxHeight,
		onSelect: (...args: Parameters<NonNullable<typeof onSelect>>) => onSelect?.(...args),
		onDirectoryChange: (...args: Parameters<NonNullable<typeof onDirectoryChange>>) => onDirectoryChange?.(...args),
		onError: (...args: Parameters<NonNullable<typeof onError>>) => onError?.(...args),
	})

	useFilePicker({ isDisabled: () => isDisabled, onCancel, state })

	const theme = useComponentTheme<FilePickerRenderTheme>('FilePicker')
	const { styles, config } = theme ?? defaultFilePickerTheme

	let wnode = $derived(renderFilePicker(
		{
			currentPath: state.currentPath(),
			visibleEntries: state.visibleEntries(),
			mode: state.mode(),
			filterText: state.filterText(),
			multiSelect,
			showDetails,
			errorMessage: state.errorMessage(),
			hasScrollUp: state.hasScrollUp(),
			hasScrollDown: state.hasScrollDown(),
			scrollUpCount: state.scrollUpCount(),
			scrollDownCount: state.scrollDownCount(),
		},
		{ styles, config }
	))
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<wolfie-box use:mountWNode={wnode}></wolfie-box>
<!-- #endregion Template -->
