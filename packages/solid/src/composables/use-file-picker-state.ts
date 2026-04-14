import { basename } from 'node:path'
import { createSignal, createMemo, createEffect, on, onMount } from 'solid-js'
import {
	filePickerReducer,
	createDefaultFilePickerState,
	readDirectory,
	formatFileSize,
	type FilePickerState,
	type FilePickerAction,
	type FileTypeFilter,
	type FilePickerMode,
} from '@wolf-tui/shared'
import type { FilePickerVisibleEntry } from '@wolf-tui/shared'

//#region Types
export type UseFilePickerStateProps = {
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
	 * Called on every selection toggle (Space key). Fires in real-time
	 * as the user toggles items, unlike onSelect which fires on confirmation.
	 */
	onSelectionChange?: (paths: string[]) => void

	/**
	 * Called when the current directory changes.
	 */
	onDirectoryChange?: (path: string) => void
}

export type FilePickerStateResult = {
	currentPath: () => string
	visibleEntries: () => FilePickerVisibleEntry[]
	mode: () => FilePickerMode
	filterText: () => string
	multiSelect: () => boolean
	showDetails: () => boolean
	selectedPaths: () => ReadonlySet<string>
	errorMessage: () => string | undefined
	hasScrollUp: () => boolean
	hasScrollDown: () => boolean
	scrollUpCount: () => number
	scrollDownCount: () => number
	dispatch: (action: FilePickerAction) => void
	loadDirectory: (path: string) => void
}
//#endregion Types

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
}: UseFilePickerStateProps): FilePickerStateResult => {
	const initialState = createDefaultFilePickerState({
		initialPath,
		multiSelect,
		fileTypes,
		showHidden,
		showDetails,
		maxHeight,
	})

	const [state, setState] = createSignal<FilePickerState>(initialState)

	const dispatch = (action: FilePickerAction) => {
		setState((prev) => filePickerReducer(prev, action))
	}

	const loadDirectory = (path: string) => {
		dispatch({ type: 'set-loading' })

		readDirectory(path, { showHidden })
			.then((entries) => {
				dispatch({ type: 'set-entries', path, entries })
			})
			.catch((err: unknown) => {
				const message = err instanceof Error ? err.message : String(err)
				dispatch({ type: 'set-error', error: message })
			})
	}

	// Load initial directory on mount
	onMount(() => {
		loadDirectory(initialPath)
	})

	// Watch for path changes to trigger directory loading
	createEffect(
		on(
			() => state().currentPath,
			(newPath, oldPath) => {
				if (newPath !== oldPath && state().mode === 'loading') {
					loadDirectory(newPath)
					onDirectoryChange?.(newPath)
				}
			},
			{ defer: true }
		)
	)

	// Watch previousSelectedPaths for onSelect callback -- fires on confirmation, not every toggle
	createEffect(
		on(
			() => state().previousSelectedPaths,
			(_current, _prev) => {
				const paths = state().selectedPaths
				if (_current !== _prev && paths.size > 0) {
					onSelect?.([...paths])
				}
			},
			{ defer: true }
		)
	)

	// onSelectionChange — fires on every toggle (Space), not just confirmation
	createEffect(
		on(
			() => state().selectedPaths,
			(current, previous) => {
				if (current !== previous) {
					onSelectionChange?.([...current])
				}
			},
			{ defer: true }
		)
	)

	const currentPath = createMemo(() => state().currentPath)
	const mode = createMemo(() => state().mode)
	const filterText = createMemo(() => state().filterText)
	const multiSelectSignal = createMemo(() => state().multiSelect)
	const showDetailsSignal = createMemo(() => state().showDetails)
	const selectedPaths = createMemo(() => state().selectedPaths)
	const errorMessage = createMemo(() => state().errorMessage)

	const visibleEntries = createMemo((): FilePickerVisibleEntry[] => {
		const s = state()
		const entries = s.mode === 'filtering' ? s.filteredEntries : s.entries
		const {
			viewportFrom,
			viewportTo,
			focusedIndex,
			selectedPaths: selected,
		} = s

		const visible: FilePickerVisibleEntry[] = []
		for (let i = viewportFrom; i < viewportTo && i < entries.length; i++) {
			const entry = entries[i]!
			const symlinkBasename = entry.symlinkTarget
				? basename(entry.symlinkTarget)
				: undefined
			const displayName =
				entry.kind === 'directory'
					? `${entry.name}/`
					: entry.kind === 'symlink' && symlinkBasename
						? `${entry.name} -> ${symlinkBasename}`
						: entry.name

			visible.push({
				name: entry.name,
				displayName,
				path: entry.path,
				kind: entry.kind,
				symlinkTargetKind: entry.symlinkTargetKind,
				symlinkTargetBasename: symlinkBasename,
				size: formatFileSize(entry.size),
				isSelected: selected.has(entry.path),
				isFocused: i === focusedIndex,
			})
		}

		return visible
	})

	const hasScrollUp = createMemo(() => state().viewportFrom > 0)
	const hasScrollDown = createMemo(() => {
		const s = state()
		const entries = s.mode === 'filtering' ? s.filteredEntries : s.entries
		return s.viewportTo < entries.length
	})
	const scrollUpCount = createMemo(() => state().viewportFrom)
	const scrollDownCount = createMemo(() => {
		const s = state()
		const entries = s.mode === 'filtering' ? s.filteredEntries : s.entries
		return Math.max(0, entries.length - s.viewportTo)
	})

	return {
		currentPath,
		visibleEntries,
		mode,
		filterText,
		multiSelect: multiSelectSignal,
		showDetails: showDetailsSignal,
		selectedPaths,
		errorMessage,
		hasScrollUp,
		hasScrollDown,
		scrollUpCount,
		scrollDownCount,
		dispatch,
		loadDirectory,
	}
}
//#endregion Composable
