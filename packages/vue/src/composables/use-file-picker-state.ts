import { basename } from 'node:path'
import { ref, computed, watch, onMounted, type ComputedRef } from 'vue'
import {
	filePickerReducer,
	createDefaultFilePickerState,
	readDirectory,
	type FilePickerAction,
	type FileTypeFilter,
	type FilePickerMode,
	type IFileEntry,
} from '@wolf-tui/shared'
import type { FilePickerVisibleEntry } from '@wolf-tui/shared'

//#region Types
export interface IUseFilePickerStateProps {
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
	 * Callback when selection is confirmed.
	 */
	onSelect?: (selectedPaths: string[]) => void

	/**
	 * Callback when current directory changes.
	 */
	onDirectoryChange?: (path: string) => void

	/**
	 * Callback on error.
	 */
	onError?: (error: string) => void
}

export interface IFilePickerState {
	currentPath: ComputedRef<string>
	visibleEntries: ComputedRef<FilePickerVisibleEntry[]>
	mode: ComputedRef<FilePickerMode>
	filterText: ComputedRef<string>
	multiSelect: boolean
	showDetails: boolean
	selectedPaths: ComputedRef<ReadonlySet<string>>
	errorMessage: ComputedRef<string | undefined>
	hasScrollUp: ComputedRef<boolean>
	hasScrollDown: ComputedRef<boolean>
	scrollUpCount: ComputedRef<number>
	scrollDownCount: ComputedRef<number>
	focusNext: () => void
	focusPrevious: () => void
	focusFirst: () => void
	focusLast: () => void
	select: () => void
	toggleSelect: () => void
	goParent: () => void
	enterDirectory: () => void
	enterFilterMode: () => void
	exitFilterMode: () => void
	filterInsert: (text: string) => void
	filterDelete: () => void
	retry: () => void
}
//#endregion Types

//#region Helpers
function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes}B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`
	if (bytes < 1024 * 1024 * 1024)
		return `${(bytes / (1024 * 1024)).toFixed(1)}M`
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}G`
}
//#endregion Helpers

//#region Composable
export const useFilePickerState = ({
	initialPath = '.',
	multiSelect = false,
	fileTypes = 'all',
	showHidden = false,
	showDetails = false,
	maxHeight = 10,
	onSelect,
	onDirectoryChange,
	onError,
}: IUseFilePickerStateProps): IFilePickerState => {
	const initialState = createDefaultFilePickerState({
		initialPath,
		multiSelect,
		fileTypes,
		showHidden,
		showDetails,
		maxHeight,
	})

	const state = ref(initialState)

	//#region Directory Loading
	function loadDirectory(path: string) {
		dispatch({ type: 'set-loading' })

		readDirectory(path, { showHidden })
			.then((entries) => {
				dispatch({ type: 'set-entries', path, entries })
			})
			.catch((err: Error) => {
				dispatch({ type: 'set-error', error: err.message })
			})
	}
	//#endregion Directory Loading

	//#region Derived State
	const currentPath = computed(() => state.value.currentPath)
	const mode = computed(() => state.value.mode)
	const filterText = computed(() => state.value.filterText)
	const selectedPaths = computed(() => state.value.selectedPaths)
	const errorMessage = computed(() => state.value.errorMessage)

	const hasScrollUp = computed(() => state.value.viewportFrom > 0)
	const hasScrollDown = computed(() => {
		const active =
			state.value.mode === 'filtering'
				? state.value.filteredEntries
				: state.value.entries
		return state.value.viewportTo < active.length
	})
	const scrollUpCount = computed(() => state.value.viewportFrom)
	const scrollDownCount = computed(() => {
		const active =
			state.value.mode === 'filtering'
				? state.value.filteredEntries
				: state.value.entries
		return active.length - state.value.viewportTo
	})

	const visibleEntries = computed((): FilePickerVisibleEntry[] => {
		const active: ReadonlyArray<IFileEntry> =
			state.value.mode === 'filtering'
				? state.value.filteredEntries
				: state.value.entries
		const visible = active.slice(
			state.value.viewportFrom,
			state.value.viewportTo
		)

		return visible.map((entry, idx) => {
			const globalIdx = state.value.viewportFrom + idx
			const symlinkBasename = entry.symlinkTarget
				? basename(entry.symlinkTarget)
				: undefined

			let displayName = entry.name
			if (entry.kind === 'directory') {
				displayName = `${entry.name}/`
			} else if (entry.kind === 'symlink' && symlinkBasename) {
				displayName = `${entry.name} -> ${symlinkBasename}`
			}

			return {
				name: entry.name,
				displayName,
				path: entry.path,
				kind: entry.kind,
				symlinkTargetKind: entry.symlinkTargetKind,
				symlinkTargetBasename: symlinkBasename,
				size: formatFileSize(entry.size),
				isSelected: state.value.selectedPaths.has(entry.path),
				isFocused: globalIdx === state.value.focusedIndex,
			}
		})
	})
	//#endregion Derived State

	//#region Watchers
	watch(
		() => state.value.previousSelectedPaths,
		(_prev, oldPrev) => {
			if (_prev !== oldPrev && state.value.selectedPaths.size > 0) {
				onSelect?.([...state.value.selectedPaths])
			}
		}
	)

	watch(
		() => state.value.currentPath,
		(newPath) => {
			onDirectoryChange?.(newPath)
		}
	)

	watch(
		() => state.value.errorMessage,
		(msg) => {
			if (msg !== undefined) {
				onError?.(msg)
			}
		}
	)

	// Reload directory when currentPath changes to 'loading' mode
	watch(
		() => state.value.mode,
		(newMode) => {
			if (newMode === 'loading') {
				loadDirectory(state.value.currentPath)
			}
		}
	)
	//#endregion Watchers

	// Initial directory load
	onMounted(() => {
		loadDirectory(state.value.currentPath)
	})

	//#region Actions
	const dispatch = (action: FilePickerAction) => {
		state.value = filePickerReducer(state.value, action)
	}
	//#endregion Actions

	return {
		currentPath,
		visibleEntries,
		mode,
		filterText,
		multiSelect,
		showDetails,
		selectedPaths,
		errorMessage,
		hasScrollUp,
		hasScrollDown,
		scrollUpCount,
		scrollDownCount,
		focusNext: () => dispatch({ type: 'focus-next' }),
		focusPrevious: () => dispatch({ type: 'focus-previous' }),
		focusFirst: () => dispatch({ type: 'focus-first' }),
		focusLast: () => dispatch({ type: 'focus-last' }),
		select: () => dispatch({ type: 'select' }),
		toggleSelect: () => dispatch({ type: 'toggle-select' }),
		goParent: () => dispatch({ type: 'go-parent' }),
		enterDirectory: () => dispatch({ type: 'enter-directory' }),
		enterFilterMode: () => dispatch({ type: 'enter-filter-mode' }),
		exitFilterMode: () => dispatch({ type: 'exit-filter-mode' }),
		filterInsert: (text: string) => dispatch({ type: 'filter-insert', text }),
		filterDelete: () => dispatch({ type: 'filter-delete' }),
		retry: () => dispatch({ type: 'retry' }),
	}
}
//#endregion Composable
