import {
	defineComponent,
	toRef,
	type PropType,
	type DefineComponent,
} from 'vue'
import {
	renderFilePicker,
	defaultFilePickerTheme,
	type FilePickerRenderTheme,
	type FileTypeFilter,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { useFilePickerState } from '../composables/use-file-picker-state'
import { useFilePicker } from '../composables/use-file-picker'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface FilePickerProps {
	/**
	 * Initial directory path.
	 *
	 * @default '.'
	 */
	initialPath?: string

	/**
	 * Allow multiple file selection.
	 *
	 * @default false
	 */
	multiSelect?: boolean

	/**
	 * Filter by file type.
	 *
	 * @default 'all'
	 */
	fileTypes?: FileTypeFilter

	/**
	 * Show hidden files (dotfiles).
	 *
	 * @default false
	 */
	showHidden?: boolean

	/**
	 * Show file details (size).
	 *
	 * @default false
	 */
	showDetails?: boolean

	/**
	 * Maximum visible entries.
	 *
	 * @default 10
	 */
	maxHeight?: number

	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Callback when selection is confirmed.
	 */
	onSelect?: (selectedPaths: string[]) => void

	/**
	 * Callback on cancel (Escape).
	 */
	onCancel?: () => void

	/**
	 * Callback when current directory changes.
	 */
	onDirectoryChange?: (path: string) => void

	/**
	 * Callback on error.
	 */
	onError?: (error: string) => void
}
//#endregion Types

//#region Component
export const FilePicker: DefineComponent<FilePickerProps> = defineComponent({
	name: 'FilePicker',
	props: {
		initialPath: {
			type: String,
			default: '.',
		},
		multiSelect: {
			type: Boolean,
			default: false,
		},
		fileTypes: {
			type: String as PropType<FileTypeFilter>,
			default: 'all',
		},
		showHidden: {
			type: Boolean,
			default: false,
		},
		showDetails: {
			type: Boolean,
			default: false,
		},
		maxHeight: {
			type: Number,
			default: 10,
		},
		isDisabled: {
			type: Boolean,
			default: false,
		},
		onSelect: {
			type: Function as PropType<(selectedPaths: string[]) => void>,
			default: undefined,
		},
		onCancel: {
			type: Function as PropType<() => void>,
			default: undefined,
		},
		onDirectoryChange: {
			type: Function as PropType<(path: string) => void>,
			default: undefined,
		},
		onError: {
			type: Function as PropType<(error: string) => void>,
			default: undefined,
		},
	},
	setup(props) {
		const state = useFilePickerState({
			initialPath: props.initialPath,
			multiSelect: props.multiSelect,
			fileTypes: props.fileTypes,
			showHidden: props.showHidden,
			showDetails: props.showDetails,
			maxHeight: props.maxHeight,
			onSelect: props.onSelect,
			onDirectoryChange: props.onDirectoryChange,
			onError: props.onError,
		})

		useFilePicker({
			isDisabled: toRef(props, 'isDisabled'),
			onCancel: props.onCancel,
			state,
		})

		const theme = useComponentTheme<FilePickerRenderTheme>('FilePicker')
		const { styles, config } = theme ?? defaultFilePickerTheme

		return () => {
			return wNodeToVue(
				renderFilePicker(
					{
						currentPath: state.currentPath.value,
						visibleEntries: state.visibleEntries.value,
						mode: state.mode.value,
						filterText: state.filterText.value,
						multiSelect: state.multiSelect,
						showDetails: state.showDetails,
						errorMessage: state.errorMessage.value,
						hasScrollUp: state.hasScrollUp.value,
						hasScrollDown: state.hasScrollDown.value,
						scrollUpCount: state.scrollUpCount.value,
						scrollDownCount: state.scrollDownCount.value,
					},
					{ styles, config }
				)
			)
		}
	},
})
//#endregion Component

export {
	defaultFilePickerTheme as filePickerTheme,
	type FilePickerRenderTheme as FilePickerTheme,
}
export type { FilePickerProps as Props, FilePickerProps as IProps }
