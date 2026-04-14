import type { IFileEntry } from '../lib/directory-reader'

//#region Types
export type FileTypeFilter = 'files' | 'directories' | 'all'
export type FilePickerMode = 'loading' | 'browsing' | 'filtering' | 'error'

export type FilePickerState = {
	currentPath: string
	pathHistory: string[]
	entries: IFileEntry[]
	focusedIndex: number
	selectedPaths: ReadonlySet<string>
	previousSelectedPaths: ReadonlySet<string>
	multiSelect: boolean
	fileTypes: FileTypeFilter
	showHidden: boolean
	showDetails: boolean
	// Filter mode
	mode: FilePickerMode
	filterText: string
	filteredEntries: IFileEntry[]
	// Viewport
	maxHeight: number
	viewportFrom: number
	viewportTo: number
	// Error (only present when mode === 'error')
	errorMessage?: string
}

export type FilePickerAction =
	| { type: 'focus-next' }
	| { type: 'focus-previous' }
	| { type: 'focus-first' }
	| { type: 'focus-last' }
	| { type: 'select' }
	| { type: 'toggle-select' }
	| { type: 'go-parent' }
	| { type: 'enter-directory' }
	| { type: 'enter-filter-mode' }
	| { type: 'exit-filter-mode' }
	| { type: 'filter-insert'; text: string }
	| { type: 'filter-delete' }
	| { type: 'set-entries'; path: string; entries: IFileEntry[] }
	| { type: 'set-loading' }
	| { type: 'set-error'; error: string }
	| { type: 'retry' }
	| { type: 'reset'; state: FilePickerState }
//#endregion Types

//#region Helpers
function filterEntries(
	entries: ReadonlyArray<IFileEntry>,
	filterText: string
): IFileEntry[] {
	if (!filterText) {
		return [...entries]
	}
	const lower = filterText.toLowerCase()
	return entries.filter((e) => e.name.toLowerCase().includes(lower))
}

function getActiveEntries(state: FilePickerState): ReadonlyArray<IFileEntry> {
	return state.mode === 'filtering' ? state.filteredEntries : state.entries
}

function clampIndex(index: number, length: number): number {
	if (length === 0) return 0
	return Math.max(0, Math.min(index, length - 1))
}

function computeViewport(
	focusedIndex: number,
	maxHeight: number,
	totalCount: number,
	currentFrom: number,
	currentTo: number
): { viewportFrom: number; viewportTo: number } {
	if (totalCount <= maxHeight) {
		return { viewportFrom: 0, viewportTo: totalCount }
	}

	// Focus is below viewport — scroll down
	if (focusedIndex >= currentTo) {
		const viewportTo = Math.min(totalCount, focusedIndex + 1)
		const viewportFrom = viewportTo - maxHeight
		return { viewportFrom, viewportTo }
	}

	// Focus is above viewport — scroll up
	if (focusedIndex < currentFrom) {
		const viewportFrom = focusedIndex
		const viewportTo = viewportFrom + maxHeight
		return { viewportFrom, viewportTo }
	}

	return { viewportFrom: currentFrom, viewportTo: currentTo }
}

function getParentPath(currentPath: string): string {
	// Remove trailing slash, then find last separator
	const trimmed = currentPath.replace(/\/+$/, '')
	const lastSlash = trimmed.lastIndexOf('/')
	if (lastSlash <= 0) return '/'
	return trimmed.slice(0, lastSlash)
}
//#endregion Helpers

//#region Reducer
export function filePickerReducer(
	state: FilePickerState,
	action: FilePickerAction
): FilePickerState {
	switch (action.type) {
		case 'focus-next': {
			const active = getActiveEntries(state)
			if (active.length === 0) return state

			const nextIndex = clampIndex(state.focusedIndex + 1, active.length)
			if (nextIndex === state.focusedIndex) return state

			const viewport = computeViewport(
				nextIndex,
				state.maxHeight,
				active.length,
				state.viewportFrom,
				state.viewportTo
			)

			return { ...state, focusedIndex: nextIndex, ...viewport }
		}

		case 'focus-previous': {
			const active = getActiveEntries(state)
			if (active.length === 0) return state

			const prevIndex = clampIndex(state.focusedIndex - 1, active.length)
			if (prevIndex === state.focusedIndex) return state

			const viewport = computeViewport(
				prevIndex,
				state.maxHeight,
				active.length,
				state.viewportFrom,
				state.viewportTo
			)

			return { ...state, focusedIndex: prevIndex, ...viewport }
		}

		case 'focus-first': {
			const active = getActiveEntries(state)
			if (active.length === 0) return state

			const viewport = computeViewport(
				0,
				state.maxHeight,
				active.length,
				state.viewportFrom,
				state.viewportTo
			)

			return { ...state, focusedIndex: 0, ...viewport }
		}

		case 'focus-last': {
			const active = getActiveEntries(state)
			if (active.length === 0) return state

			const lastIndex = active.length - 1
			const viewport = computeViewport(
				lastIndex,
				state.maxHeight,
				active.length,
				state.viewportFrom,
				state.viewportTo
			)

			return { ...state, focusedIndex: lastIndex, ...viewport }
		}

		case 'select': {
			const active = getActiveEntries(state)
			const focused = active[state.focusedIndex]
			if (!focused) return state

			// Directory or symlink-to-directory — navigate into it
			const isNavigable =
				focused.kind === 'directory' ||
				(focused.kind === 'symlink' &&
					focused.symlinkTargetKind === 'directory')

			if (isNavigable) {
				const targetPath =
					focused.kind === 'symlink' && focused.symlinkTarget
						? focused.symlinkTarget
						: focused.path
				return {
					...state,
					currentPath: targetPath,
					pathHistory: [...state.pathHistory, state.currentPath],
					mode: 'loading',
					filterText: '',
				}
			}

			// File or symlink-to-file — select it
			if (state.fileTypes === 'directories') return state

			if (state.multiSelect) {
				// Auto-select focused if nothing toggled yet
				if (state.selectedPaths.size === 0) {
					return {
						...state,
						previousSelectedPaths: state.selectedPaths,
						selectedPaths: new Set([focused.path]),
					}
				}
				// Otherwise confirm current selections
				return {
					...state,
					previousSelectedPaths: state.selectedPaths,
				}
			}

			const nextSelected = new Set([focused.path])
			return {
				...state,
				previousSelectedPaths: state.selectedPaths,
				selectedPaths: nextSelected,
			}
		}

		case 'toggle-select': {
			if (!state.multiSelect) return state

			const active = getActiveEntries(state)
			const focused = active[state.focusedIndex]
			if (!focused) return state

			// Determine effective kind for symlinks
			const effectiveKind =
				focused.kind === 'symlink' && focused.symlinkTargetKind
					? focused.symlinkTargetKind
					: focused.kind

			// Skip directories if fileTypes is 'files'
			if (state.fileTypes === 'files' && effectiveKind === 'directory') {
				return state
			}
			// Skip files if fileTypes is 'directories'
			if (state.fileTypes === 'directories' && effectiveKind !== 'directory') {
				return state
			}

			const nextSelected = new Set(state.selectedPaths)
			if (nextSelected.has(focused.path)) {
				nextSelected.delete(focused.path)
			} else {
				nextSelected.add(focused.path)
			}

			return { ...state, selectedPaths: nextSelected }
		}

		case 'go-parent': {
			// Pop from pathHistory if available (fixes symlink back-navigation),
			// otherwise fall back to getParentPath()
			const history = [...state.pathHistory]
			const popped = history.pop()
			const targetPath = popped ?? getParentPath(state.currentPath)
			if (targetPath === state.currentPath) return state

			return {
				...state,
				currentPath: targetPath,
				pathHistory: popped !== undefined ? history : state.pathHistory,
				mode: 'loading',
				filterText: '',
				selectedPaths: new Set<string>(),
			}
		}

		case 'enter-directory': {
			const active = getActiveEntries(state)
			const focused = active[state.focusedIndex]
			if (!focused) return state

			// Allow navigating into directories or symlinks-to-directories
			const canNavigate =
				focused.kind === 'directory' ||
				(focused.kind === 'symlink' &&
					focused.symlinkTargetKind === 'directory')
			if (!canNavigate) return state

			const dirTarget =
				focused.kind === 'symlink' && focused.symlinkTarget
					? focused.symlinkTarget
					: focused.path

			return {
				...state,
				currentPath: dirTarget,
				pathHistory: [...state.pathHistory, state.currentPath],
				mode: 'loading',
				filterText: '',
			}
		}

		case 'enter-filter-mode': {
			return {
				...state,
				mode: 'filtering',
				filterText: '',
				filteredEntries: [...state.entries],
				focusedIndex: 0,
				viewportFrom: 0,
				viewportTo: Math.min(state.entries.length, state.maxHeight),
			}
		}

		case 'exit-filter-mode': {
			return {
				...state,
				mode: 'browsing',
				filterText: '',
				filteredEntries: [...state.entries],
				focusedIndex: 0,
				viewportFrom: 0,
				viewportTo: Math.min(state.entries.length, state.maxHeight),
			}
		}

		case 'filter-insert': {
			const nextFilter = state.filterText + action.text
			const nextFiltered = filterEntries(state.entries, nextFilter)
			const nextFocused = clampIndex(0, nextFiltered.length)

			return {
				...state,
				filterText: nextFilter,
				filteredEntries: nextFiltered,
				focusedIndex: nextFocused,
				viewportFrom: 0,
				viewportTo: Math.min(nextFiltered.length, state.maxHeight),
			}
		}

		case 'filter-delete': {
			if (state.filterText.length === 0) {
				// Exit filter mode when deleting on empty filter text
				return {
					...state,
					mode: 'browsing',
					filteredEntries: [...state.entries],
					focusedIndex: 0,
					viewportFrom: 0,
					viewportTo: Math.min(state.entries.length, state.maxHeight),
				}
			}

			const nextFilter = state.filterText.slice(0, -1)
			const nextFiltered = filterEntries(state.entries, nextFilter)
			const nextFocused = clampIndex(state.focusedIndex, nextFiltered.length)

			return {
				...state,
				filterText: nextFilter,
				filteredEntries: nextFiltered,
				focusedIndex: nextFocused,
				viewportFrom: 0,
				viewportTo: Math.min(nextFiltered.length, state.maxHeight),
			}
		}

		case 'set-entries': {
			const entries = action.entries
			const filtered = filterEntries(
				entries,
				state.mode === 'filtering' ? state.filterText : ''
			)

			return {
				...state,
				currentPath: action.path,
				entries,
				filteredEntries: filtered,
				focusedIndex: 0,
				mode: 'browsing',
				errorMessage: undefined,
				viewportFrom: 0,
				viewportTo: Math.min(
					state.mode === 'filtering' ? filtered.length : entries.length,
					state.maxHeight
				),
			}
		}

		case 'set-loading': {
			return { ...state, mode: 'loading', errorMessage: undefined }
		}

		case 'set-error': {
			return { ...state, mode: 'error', errorMessage: action.error }
		}

		case 'retry': {
			return { ...state, mode: 'loading', errorMessage: undefined }
		}

		case 'reset': {
			return action.state
		}

		default:
			return state
	}
}
//#endregion Reducer

//#region Factory
export function createDefaultFilePickerState(options: {
	initialPath?: string
	multiSelect?: boolean
	fileTypes?: FileTypeFilter
	showHidden?: boolean
	showDetails?: boolean
	maxHeight?: number
}): FilePickerState {
	const maxHeight = options.maxHeight ?? 10

	return {
		currentPath: options.initialPath ?? '.',
		pathHistory: [],
		entries: [],
		focusedIndex: 0,
		selectedPaths: new Set(),
		previousSelectedPaths: new Set(),
		multiSelect: options.multiSelect ?? false,
		fileTypes: options.fileTypes ?? 'all',
		showHidden: options.showHidden ?? false,
		showDetails: options.showDetails ?? false,
		mode: 'loading',
		filterText: '',
		filteredEntries: [],
		maxHeight,
		viewportFrom: 0,
		viewportTo: 0,
	}
}
//#endregion Factory
