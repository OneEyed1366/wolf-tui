import {
	filePickerReducer,
	createDefaultFilePickerState,
	readDirectory,
	formatFileSize,
	type FilePickerState,
	type FileTypeFilter,
	type FilePickerMode,
	type IFileEntry,
} from '@wolf-tui/shared'
import type { FilePickerVisibleEntry } from '@wolf-tui/shared'
import { basename } from 'node:path'

//#region Types
export type UseFilePickerStateProps = {
	initialPath?: string
	multiSelect?: boolean
	fileTypes?: FileTypeFilter
	showHidden?: boolean
	showDetails?: boolean
	maxHeight?: number
	onSelect?: (paths: string[]) => void
	onSelectionChange?: (paths: string[]) => void
	onDirectoryChange?: (path: string) => void
	onError?: (error: string) => void
}

export type FilePickerStateResult = {
	currentPath: () => string
	visibleEntries: () => FilePickerVisibleEntry[]
	mode: () => FilePickerMode
	filterText: () => string
	multiSelect: () => boolean
	showDetails: () => boolean
	errorMessage: () => string | undefined
	selectedPaths: () => ReadonlySet<string>
	hasScrollUp: () => boolean
	hasScrollDown: () => boolean
	scrollUpCount: () => number
	scrollDownCount: () => number
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
	loadDirectory: (path: string) => void
}
//#endregion Types

//#region Helpers
function buildDisplayName(entry: IFileEntry): string {
	let name = entry.name
	if (entry.kind === 'directory') {
		name += '/'
	}
	if (entry.kind === 'symlink' && entry.symlinkTarget) {
		name += ` -> ${basename(entry.symlinkTarget)}`
	}
	return name
}

function deriveSymlinkTargetBasename(entry: IFileEntry): string | undefined {
	if (entry.kind === 'symlink' && entry.symlinkTarget) {
		return basename(entry.symlinkTarget)
	}
	return undefined
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
	onSelectionChange,
	onDirectoryChange,
	onError,
}: UseFilePickerStateProps = {}): FilePickerStateResult => {
	const initial = createDefaultFilePickerState({
		initialPath,
		multiSelect,
		fileTypes,
		showHidden,
		showDetails,
		maxHeight,
	})

	let _state = $state<FilePickerState>(initial)

	const dispatch = (action: Parameters<typeof filePickerReducer>[1]) => {
		const prevState = _state
		_state = filePickerReducer(_state, action)

		// Fire onSelect only on confirmation (previousSelectedPaths change), not every toggle
		if (
			prevState.previousSelectedPaths !== _state.previousSelectedPaths &&
			_state.selectedPaths.size > 0
		) {
			onSelect?.([..._state.selectedPaths])
		}

		if (prevState.currentPath !== _state.currentPath) {
			onDirectoryChange?.(_state.currentPath)
		}

		if (_state.mode === 'error' && _state.errorMessage !== undefined) {
			onError?.(_state.errorMessage)
		}
	}

	const loadDirectory = (path: string) => {
		dispatch({ type: 'set-loading' })

		readDirectory(path, {
			showHidden: _state.showHidden,
		})
			.then((entries) => {
				dispatch({ type: 'set-entries', path, entries })
			})
			.catch((err: unknown) => {
				const message = err instanceof Error ? err.message : String(err)
				dispatch({ type: 'set-error', error: message })
			})
	}

	const currentPath = () => _state.currentPath
	const mode = () => _state.mode
	const filterText = () => _state.filterText
	const multiSelectAccessor = () => _state.multiSelect
	const showDetailsAccessor = () => _state.showDetails
	const errorMessage = () => _state.errorMessage
	const selectedPaths = () => _state.selectedPaths

	const getActiveEntries = (): ReadonlyArray<IFileEntry> => {
		return _state.mode === 'filtering' ? _state.filteredEntries : _state.entries
	}

	const visibleEntries = (): FilePickerVisibleEntry[] => {
		const active = getActiveEntries()
		const from = _state.viewportFrom
		const to = _state.viewportTo
		const slice = active.slice(from, to)

		return slice.map((entry, idx) => ({
			name: entry.name,
			displayName: buildDisplayName(entry),
			path: entry.path,
			kind: entry.kind,
			symlinkTargetKind: entry.symlinkTargetKind,
			symlinkTargetBasename: deriveSymlinkTargetBasename(entry),
			size: formatFileSize(entry.size),
			isSelected: _state.selectedPaths.has(entry.path),
			isFocused: from + idx === _state.focusedIndex,
		}))
	}

	const hasScrollUp = () => _state.viewportFrom > 0
	const hasScrollDown = () => {
		const active = getActiveEntries()
		return _state.viewportTo < active.length
	}
	const scrollUpCount = () => _state.viewportFrom
	const scrollDownCount = () => {
		const active = getActiveEntries()
		return active.length - _state.viewportTo
	}

	const focusNext = () => dispatch({ type: 'focus-next' })
	const focusPrevious = () => dispatch({ type: 'focus-previous' })
	const focusFirst = () => dispatch({ type: 'focus-first' })
	const focusLast = () => dispatch({ type: 'focus-last' })

	const select = () => {
		const prevPath = _state.currentPath
		dispatch({ type: 'select' })
		// If navigation happened, load the new directory
		if (_state.mode === 'loading' && _state.currentPath !== prevPath) {
			loadDirectory(_state.currentPath)
		}
	}

	const toggleSelect = () => dispatch({ type: 'toggle-select' })

	const goParent = () => {
		const prevPath = _state.currentPath
		dispatch({ type: 'go-parent' })
		if (_state.mode === 'loading' && _state.currentPath !== prevPath) {
			loadDirectory(_state.currentPath)
		}
	}

	const enterDirectory = () => {
		const prevPath = _state.currentPath
		dispatch({ type: 'enter-directory' })
		if (_state.mode === 'loading' && _state.currentPath !== prevPath) {
			loadDirectory(_state.currentPath)
		}
	}

	const enterFilterMode = () => dispatch({ type: 'enter-filter-mode' })
	const exitFilterMode = () => dispatch({ type: 'exit-filter-mode' })
	const filterInsert = (text: string) =>
		dispatch({ type: 'filter-insert', text })
	const filterDelete = () => dispatch({ type: 'filter-delete' })

	const retry = () => {
		dispatch({ type: 'retry' })
		loadDirectory(_state.currentPath)
	}

	// onSelectionChange — fires on every toggle (Space), not just confirmation
	let prevSelectedPaths: ReadonlySet<string> = _state.selectedPaths
	$effect(() => {
		const current = _state.selectedPaths
		if (current !== prevSelectedPaths) {
			prevSelectedPaths = current
			onSelectionChange?.([...current])
		}
	})

	// Load initial directory
	$effect(() => {
		loadDirectory(initialPath)
	})

	return {
		currentPath,
		visibleEntries,
		mode,
		filterText,
		multiSelect: multiSelectAccessor,
		showDetails: showDetailsAccessor,
		errorMessage,
		selectedPaths,
		hasScrollUp,
		hasScrollDown,
		scrollUpCount,
		scrollDownCount,
		focusNext,
		focusPrevious,
		focusFirst,
		focusLast,
		select,
		toggleSelect,
		goParent,
		enterDirectory,
		enterFilterMode,
		exitFilterMode,
		filterInsert,
		filterDelete,
		retry,
		loadDirectory,
	}
}
//#endregion Composable
