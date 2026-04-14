import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react'
import {
	filePickerReducer,
	createDefaultFilePickerState,
	readDirectory,
	type FilePickerState,
	type FileTypeFilter,
	type IFileEntry,
} from '@wolf-tui/shared'

//#region Types
export type IUseFilePickerStateProps = {
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
	 * Filter by entry kind: 'files', 'directories', or 'all'.
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
	 * Callback when selection is confirmed (Enter key).
	 */
	onSelect?: (paths: string[]) => void

	/**
	 * Callback on every selection toggle (Space key). Fires in real-time
	 * as the user toggles items, unlike onSelect which fires on confirmation.
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

export type IFilePickerState = {
	currentPath: string
	entries: IFileEntry[]
	focusedIndex: number
	selectedPaths: ReadonlySet<string>
	multiSelect: boolean
	showDetails: boolean
	mode: FilePickerState['mode']
	filterText: string
	viewportFrom: number
	viewportTo: number
	errorMessage: string | undefined
	activeEntries: ReadonlyArray<IFileEntry>
	visibleEntries: IFileEntry[]

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
}
//#endregion Types

//#region Hook
export function useFilePickerState({
	initialPath = '.',
	filter,
	showHidden = false,
	showDetails = false,
	multiSelect = false,
	fileTypes = 'all',
	maxHeight = 10,
	onSelect,
	onSelectionChange,
	onCancel: _onCancel,
	onDirectoryChange,
}: IUseFilePickerStateProps): IFilePickerState {
	const [state, dispatch] = useReducer(
		filePickerReducer,
		{ initialPath, multiSelect, fileTypes, showHidden, showDetails, maxHeight },
		createDefaultFilePickerState
	)

	const prevPathRef = useRef(state.currentPath)
	const prevSelectedRef = useRef(state.previousSelectedPaths)
	const filterRef = useRef(filter)
	filterRef.current = filter

	// Load directory on mount and when currentPath changes
	useEffect(() => {
		let cancelled = false
		const currentFilter = filterRef.current

		dispatch({ type: 'set-loading' })
		readDirectory(state.currentPath, { showHidden })
			.then((entries) => {
				if (cancelled) return

				let filtered = entries
				if (currentFilter) {
					if (typeof currentFilter === 'string') {
						const lower = currentFilter.toLowerCase()
						filtered = entries.filter((e) =>
							e.name.toLowerCase().includes(lower)
						)
					} else {
						filtered = entries.filter(currentFilter)
					}
				}

				if (fileTypes === 'files') {
					filtered = filtered.filter((e) => e.kind !== 'directory')
				} else if (fileTypes === 'directories') {
					filtered = filtered.filter(
						(e) => e.kind === 'directory' || e.kind === 'symlink'
					)
				}

				dispatch({
					type: 'set-entries',
					path: state.currentPath,
					entries: filtered,
				})
			})
			.catch((err: unknown) => {
				if (cancelled) return
				const message = err instanceof Error ? err.message : String(err)
				dispatch({ type: 'set-error', error: message })
			})

		return () => {
			cancelled = true
		}
	}, [state.currentPath, showHidden, fileTypes])

	// onDirectoryChange callback
	useEffect(() => {
		if (state.currentPath !== prevPathRef.current) {
			prevPathRef.current = state.currentPath
			onDirectoryChange?.(state.currentPath)
		}
	}, [state.currentPath, onDirectoryChange])

	// onSelectionChange callback — fires on every toggle (Space)
	const prevToggleRef = useRef(state.selectedPaths)
	useEffect(() => {
		if (state.selectedPaths !== prevToggleRef.current) {
			prevToggleRef.current = state.selectedPaths
			onSelectionChange?.([...state.selectedPaths])
		}
	}, [state.selectedPaths, onSelectionChange])

	// onSelect callback — fires only on confirmation (Enter), not on every toggle
	// The shared reducer sets previousSelectedPaths on confirm actions
	useEffect(() => {
		if (
			state.previousSelectedPaths !== prevSelectedRef.current &&
			state.selectedPaths.size > 0
		) {
			prevSelectedRef.current = state.previousSelectedPaths
			onSelect?.([...state.selectedPaths])
		}
	}, [state.previousSelectedPaths, state.selectedPaths, onSelect])

	const focusNext = useCallback(() => {
		dispatch({ type: 'focus-next' })
	}, [])

	const focusPrevious = useCallback(() => {
		dispatch({ type: 'focus-previous' })
	}, [])

	const focusFirst = useCallback(() => {
		dispatch({ type: 'focus-first' })
	}, [])

	const focusLast = useCallback(() => {
		dispatch({ type: 'focus-last' })
	}, [])

	const select = useCallback(() => {
		dispatch({ type: 'select' })
	}, [])

	const toggleSelect = useCallback(() => {
		dispatch({ type: 'toggle-select' })
	}, [])

	const goParent = useCallback(() => {
		dispatch({ type: 'go-parent' })
	}, [])

	const enterDirectory = useCallback(() => {
		dispatch({ type: 'enter-directory' })
	}, [])

	const enterFilterMode = useCallback(() => {
		dispatch({ type: 'enter-filter-mode' })
	}, [])

	const exitFilterMode = useCallback(() => {
		dispatch({ type: 'exit-filter-mode' })
	}, [])

	const filterInsert = useCallback((text: string) => {
		dispatch({ type: 'filter-insert', text })
	}, [])

	const filterDelete = useCallback(() => {
		dispatch({ type: 'filter-delete' })
	}, [])

	const activeEntries = useMemo(() => {
		return state.mode === 'filtering' ? state.filteredEntries : state.entries
	}, [state.mode, state.filteredEntries, state.entries])

	const visibleEntries = useMemo(() => {
		return activeEntries.slice(state.viewportFrom, state.viewportTo)
	}, [activeEntries, state.viewportFrom, state.viewportTo])

	return {
		currentPath: state.currentPath,
		entries: state.entries,
		focusedIndex: state.focusedIndex,
		selectedPaths: state.selectedPaths,
		multiSelect: state.multiSelect,
		showDetails: state.showDetails,
		mode: state.mode,
		filterText: state.filterText,
		viewportFrom: state.viewportFrom,
		viewportTo: state.viewportTo,
		errorMessage: state.errorMessage,
		activeEntries,
		visibleEntries,
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
	}
}
//#endregion Hook
