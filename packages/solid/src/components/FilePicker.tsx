import { type JSX, splitProps, createMemo } from 'solid-js'
import {
	renderFilePicker,
	defaultFilePickerTheme,
	type FilePickerRenderTheme,
	type FileTypeFilter,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { useFilePickerState } from '../composables/use-file-picker-state'
import { useFilePicker } from '../composables/use-file-picker'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface IFilePickerProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Initial directory path.
	 *
	 * @default '.'
	 */
	initialPath?: string

	/**
	 * Allow selecting multiple files.
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
	 * Show file size details.
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
	 * Called when file selection is confirmed.
	 */
	onSelect?: (paths: string[]) => void

	/**
	 * Called on cancel (Escape).
	 */
	onCancel?: () => void

	/**
	 * Called when the current directory changes.
	 */
	onDirectoryChange?: (path: string) => void
}
//#endregion Types

//#region Component
export function FilePicker(props: IFilePickerProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'initialPath',
		'multiSelect',
		'fileTypes',
		'showHidden',
		'showDetails',
		'maxHeight',
		'onSelect',
		'onCancel',
		'onDirectoryChange',
	])

	const state = useFilePickerState({
		initialPath: local.initialPath,
		multiSelect: local.multiSelect,
		fileTypes: local.fileTypes,
		showHidden: local.showHidden,
		showDetails: local.showDetails,
		maxHeight: local.maxHeight,
		onSelect: local.onSelect,
		onDirectoryChange: local.onDirectoryChange,
	})

	useFilePicker({
		isDisabled: () => local.isDisabled,
		onCancel: local.onCancel,
		state,
	})

	const theme = useComponentTheme<FilePickerRenderTheme>('FilePicker')
	const { styles, config } = theme ?? defaultFilePickerTheme

	const wnode = createMemo(() =>
		renderFilePicker(
			{
				currentPath: state.currentPath(),
				visibleEntries: state.visibleEntries(),
				mode: state.mode(),
				filterText: state.filterText(),
				multiSelect: state.multiSelect(),
				showDetails: state.showDetails(),
				errorMessage: state.errorMessage(),
				hasScrollUp: state.hasScrollUp(),
				hasScrollDown: state.hasScrollDown(),
				scrollUpCount: state.scrollUpCount(),
				scrollDownCount: state.scrollDownCount(),
			},
			{ styles, config }
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component

export {
	defaultFilePickerTheme as filePickerTheme,
	type FilePickerRenderTheme as FilePickerTheme,
} from '@wolf-tui/shared'
