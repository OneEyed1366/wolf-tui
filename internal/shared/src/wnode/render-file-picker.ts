import figures from 'figures'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { EntryKind } from '../lib/directory-reader'
import type { FilePickerMode } from '../state/file-picker'

//#region ViewState
export type FilePickerVisibleEntry = {
	name: string
	displayName: string
	path: string
	kind: EntryKind
	symlinkTargetKind?: EntryKind
	symlinkTargetBasename?: string
	size: string
	isSelected: boolean
	isFocused: boolean
}

export type FilePickerViewState = {
	currentPath: string
	visibleEntries: FilePickerVisibleEntry[]
	mode: FilePickerMode
	filterText: string
	multiSelect: boolean
	showDetails: boolean
	errorMessage?: string
	hasScrollUp: boolean
	hasScrollDown: boolean
	scrollUpCount: number
	scrollDownCount: number
}
//#endregion ViewState

//#region Theme
export type FilePickerRenderTheme = {
	styles: {
		container: () => WNodeProps
		header: () => WNodeProps
		headerPath: () => WNodeProps
		entryRow: (props: { isFocused: boolean; kind: EntryKind }) => WNodeProps
		entryIcon: (props: { kind: EntryKind }) => WNodeProps
		entryName: (props: { isFocused: boolean; kind: EntryKind }) => WNodeProps
		entrySize: () => WNodeProps
		checkbox: (props: { isSelected: boolean }) => WNodeProps
		focusIndicator: () => WNodeProps
		filterRow: () => WNodeProps
		filterInput: () => WNodeProps
		filterPrefix: () => WNodeProps
		scrollIndicator: () => WNodeProps
		loading: () => WNodeProps
		error: () => WNodeProps
	}
	config: () => {
		directoryIcon: string
		fileIcon: string
		symlinkIcon: string
		checkedIcon: string
		uncheckedIcon: string
		filterPrefix: string
	}
}

export const defaultFilePickerTheme: FilePickerRenderTheme = {
	styles: {
		container: (): WNodeProps => ({ style: { flexDirection: 'column' } }),
		header: (): WNodeProps => ({
			style: { paddingBottom: 1 },
		}),
		headerPath: (): WNodeProps => ({
			style: { fontWeight: 'bold' },
		}),
		entryRow: ({ isFocused }): WNodeProps => ({
			style: { gap: 1, paddingLeft: isFocused ? 0 : 2 },
		}),
		entryIcon: ({ kind }): WNodeProps => {
			const color =
				kind === 'directory'
					? 'cyan'
					: kind === 'symlink'
						? 'magenta'
						: undefined
			return { style: { color } }
		},
		entryName: ({ isFocused, kind }): WNodeProps => {
			let color: string | undefined
			if (kind === 'directory') color = 'green'
			if (isFocused) color = 'blue'
			return { style: { color } }
		},
		entrySize: (): WNodeProps => ({
			style: { color: 'gray' },
		}),
		checkbox: ({ isSelected }): WNodeProps => ({
			style: { color: isSelected ? 'green' : 'gray' },
		}),
		focusIndicator: (): WNodeProps => ({
			style: { color: 'blue' },
		}),
		filterRow: (): WNodeProps => ({
			style: { paddingTop: 1, gap: 1 },
		}),
		filterInput: (): WNodeProps => ({
			style: { color: 'yellow' },
		}),
		filterPrefix: (): WNodeProps => ({
			style: { color: 'gray' },
		}),
		scrollIndicator: (): WNodeProps => ({
			style: { color: 'gray' },
		}),
		loading: (): WNodeProps => ({
			style: { color: 'yellow' },
		}),
		error: (): WNodeProps => ({
			style: { color: 'red' },
		}),
	},
	config: () => ({
		directoryIcon: '\u25B8',
		fileIcon: '\u00B7',
		symlinkIcon: '\u2933',
		checkedIcon: figures.checkboxOn,
		uncheckedIcon: figures.checkboxOff,
		filterPrefix: '/',
	}),
}
//#endregion Theme

//#region Helpers
function getEntryIcon(
	kind: EntryKind,
	config: ReturnType<FilePickerRenderTheme['config']>
): string {
	switch (kind) {
		case 'directory':
			return config.directoryIcon
		case 'symlink':
			return config.symlinkIcon
		case 'file':
			return config.fileIcon
	}
}
//#endregion Helpers

//#region Render
export function renderFilePicker(
	state: FilePickerViewState,
	theme: FilePickerRenderTheme = defaultFilePickerTheme
): WNode {
	const { styles, config: getConfig } = theme
	const config = getConfig()
	const children: Array<WNode | string> = []

	// Header: current path
	const headerNode = wbox(styles.header(), [
		wtext(styles.headerPath(), [state.currentPath]),
	])
	children.push(headerNode)

	// Loading state
	if (state.mode === 'loading') {
		children.push(wtext(styles.loading(), ['Loading...']))
		return wbox(styles.container(), children)
	}

	// Error state
	if (state.mode === 'error' && state.errorMessage !== undefined) {
		children.push(wtext(styles.error(), [state.errorMessage]))
		return wbox(styles.container(), children)
	}

	// Scroll up indicator
	if (state.hasScrollUp) {
		children.push(
			wtext(styles.scrollIndicator(), [
				`${figures.arrowUp} ${state.scrollUpCount} more`,
			])
		)
	}

	// Entry rows
	for (const entry of state.visibleEntries) {
		const rowChildren: Array<WNode | string> = []

		// Focus indicator
		if (entry.isFocused) {
			rowChildren.push(wtext(styles.focusIndicator(), [figures.pointer]))
		}

		// Checkbox (multi-select only)
		if (state.multiSelect) {
			const icon = entry.isSelected ? config.checkedIcon : config.uncheckedIcon
			rowChildren.push(
				wtext(styles.checkbox({ isSelected: entry.isSelected }), [icon])
			)
		}

		// Entry icon
		const icon = getEntryIcon(entry.kind, config)
		rowChildren.push(wtext(styles.entryIcon({ kind: entry.kind }), [icon]))

		// Entry name (with trailing / for dirs and symlink target display)
		rowChildren.push(
			wtext(
				styles.entryName({
					isFocused: entry.isFocused,
					kind: entry.kind,
				}),
				[entry.displayName]
			)
		)

		// Size column (if showDetails, skip directories and symlinks-to-directories)
		const isDirLike =
			entry.kind === 'directory' ||
			(entry.kind === 'symlink' && entry.symlinkTargetKind === 'directory')
		if (state.showDetails && !isDirLike) {
			rowChildren.push(wtext(styles.entrySize(), [entry.size]))
		}

		children.push(
			wbox(
				styles.entryRow({ isFocused: entry.isFocused, kind: entry.kind }),
				rowChildren,
				entry.path
			)
		)
	}

	// Scroll down indicator
	if (state.hasScrollDown) {
		children.push(
			wtext(styles.scrollIndicator(), [
				`${figures.arrowDown} ${state.scrollDownCount} more`,
			])
		)
	}

	// Filter row (shown in filtering mode)
	if (state.mode === 'filtering') {
		const filterNode = wbox(styles.filterRow(), [
			wtext(styles.filterPrefix(), [config.filterPrefix]),
			wtext(styles.filterInput(), [state.filterText]),
		])
		children.push(filterNode)
	}

	return wbox(styles.container(), children)
}
//#endregion Render
