import {
	renderFilePicker,
	defaultFilePickerTheme,
	formatFileSize,
	type FilePickerRenderTheme,
	type FilePickerVisibleEntry,
	type FileTypeFilter,
	type IFileEntry,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../../theme/theme'
import { useFilePickerState } from './use-file-picker-state'
import { useFilePicker } from './use-file-picker'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type IFilePickerProps = {
	/**
	 * Initial directory path.
	 *
	 * @default '.'
	 */
	initialPath?: string

	/**
	 * String filter or predicate function for entries.
	 */
	filter?: string | ((entry: IFileEntry) => boolean)

	/**
	 * Show hidden files (dotfiles).
	 *
	 * @default false
	 */
	showHidden?: boolean

	/**
	 * Show file details (size column).
	 *
	 * @default false
	 */
	showDetails?: boolean

	/**
	 * Enable multi-selection.
	 *
	 * @default false
	 */
	multiSelect?: boolean

	/**
	 * Filter by entry kind.
	 *
	 * @default 'all'
	 */
	fileTypes?: FileTypeFilter

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
	 * Callback when selection is confirmed (Enter key).
	 */
	onSelect?: (paths: string[]) => void

	/**
	 * Callback on every selection toggle (Space key).
	 */
	onSelectionChange?: (paths: string[]) => void

	/**
	 * Callback on cancel (Escape).
	 */
	onCancel?: () => void

	/**
	 * Callback when current directory changes.
	 */
	onDirectoryChange?: (path: string) => void
}
//#endregion Types

//#region Component
export function FilePicker({
	initialPath = '.',
	filter,
	showHidden = false,
	showDetails = false,
	multiSelect = false,
	fileTypes = 'all',
	maxHeight = 10,
	isDisabled = false,
	onSelect,
	onSelectionChange,
	onCancel,
	onDirectoryChange,
}: IFilePickerProps) {
	const state = useFilePickerState({
		initialPath,
		filter,
		showHidden,
		showDetails,
		multiSelect,
		fileTypes,
		maxHeight,
		onSelect,
		onSelectionChange,
		onCancel,
		onDirectoryChange,
	})

	useFilePicker({ isDisabled, onCancel, state })

	const theme = useComponentTheme<FilePickerRenderTheme>('FilePicker')
	const resolvedTheme = theme ?? defaultFilePickerTheme

	const visibleEntries: FilePickerVisibleEntry[] = state.visibleEntries.map(
		(entry, index) => {
			const globalIndex = state.viewportFrom + index
			const displaySuffix = entry.kind === 'directory' ? '/' : ''
			const symlinkSuffix =
				entry.kind === 'symlink' && entry.symlinkTarget
					? ` -> ${entry.symlinkTarget.split('/').pop() ?? entry.symlinkTarget}`
					: ''

			return {
				name: entry.name,
				displayName: `${entry.name}${displaySuffix}${symlinkSuffix}`,
				path: entry.path,
				kind: entry.kind,
				symlinkTargetKind: entry.symlinkTargetKind,
				symlinkTargetBasename: entry.symlinkTarget
					? entry.symlinkTarget.split('/').pop()
					: undefined,
				size: formatFileSize(entry.size),
				isSelected: state.selectedPaths.has(entry.path),
				isFocused: globalIndex === state.focusedIndex,
			}
		}
	)

	const totalActive = state.activeEntries.length
	const hasScrollUp = state.viewportFrom > 0
	const hasScrollDown = state.viewportTo < totalActive

	return wNodeToReact(
		renderFilePicker(
			{
				currentPath: state.currentPath,
				visibleEntries,
				mode: state.mode,
				filterText: state.filterText,
				multiSelect,
				showDetails,
				errorMessage: state.errorMessage,
				hasScrollUp,
				hasScrollDown,
				scrollUpCount: state.viewportFrom,
				scrollDownCount: totalActive - state.viewportTo,
			},
			resolvedTheme
		)
	)
}
//#endregion Component
