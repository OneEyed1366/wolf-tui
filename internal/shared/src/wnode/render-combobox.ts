import figures from 'figures'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { IMatchRange } from '../lib/fuzzy-match'

//#region View State
export type ComboboxVisibleOption = {
	label: string
	value: string
	matchRanges: IMatchRange[]
	isFocused: boolean
}

export type ComboboxViewState = {
	inputValue: string
	cursorOffset: number
	isOpen: boolean
	visibleOptions: ComboboxVisibleOption[]
	selectedValue: string | undefined
	isDisabled: boolean
	placeholder: string
	noMatchesText: string
	hasScrollUp: boolean
	hasScrollDown: boolean
}
//#endregion View State

//#region Theme
export type ComboboxRenderTheme = {
	styles: {
		container: () => WNodeProps
		inputRow: () => WNodeProps
		prefix: () => WNodeProps
		input: (props: { isDisabled: boolean }) => WNodeProps
		cursor: () => WNodeProps
		placeholder: () => WNodeProps
		dropdown: () => WNodeProps
		option: (props: { isFocused: boolean }) => WNodeProps
		optionLabel: (props: { isFocused: boolean }) => WNodeProps
		matchHighlight: () => WNodeProps
		focusIndicator: () => WNodeProps
		noMatches: () => WNodeProps
		scrollIndicator: () => WNodeProps
	}
	config: () => { prefix: string; cursorChar: string }
}

export const defaultComboboxTheme: ComboboxRenderTheme = {
	styles: {
		container: (): WNodeProps => ({ style: { flexDirection: 'column' } }),
		inputRow: (): WNodeProps => ({ style: {} }),
		prefix: (): WNodeProps => ({ style: { color: 'blue' } }),
		input: ({ isDisabled }): WNodeProps => ({
			style: { color: isDisabled ? 'gray' : undefined },
		}),
		cursor: (): WNodeProps => ({ style: { inverse: true } }),
		placeholder: (): WNodeProps => ({ style: { color: 'gray' } }),
		dropdown: (): WNodeProps => ({
			style: { flexDirection: 'column', marginTop: 1 },
		}),
		option: ({ isFocused }): WNodeProps => ({
			style: { gap: 1, paddingLeft: isFocused ? 0 : 2 },
		}),
		optionLabel: ({ isFocused }): WNodeProps => ({
			style: { color: isFocused ? 'blue' : undefined },
		}),
		matchHighlight: (): WNodeProps => ({
			style: { fontWeight: 'bold', textDecoration: 'underline' },
		}),
		focusIndicator: (): WNodeProps => ({ style: { color: 'blue' } }),
		noMatches: (): WNodeProps => ({ style: { color: 'gray' } }),
		scrollIndicator: (): WNodeProps => ({ style: { color: 'gray' } }),
	},
	config: () => ({ prefix: '> ', cursorChar: ' ' }),
}
//#endregion Theme

//#region Helpers
function buildInputNodes(
	inputValue: string,
	cursorOffset: number,
	isDisabled: boolean,
	placeholder: string,
	styles: ComboboxRenderTheme['styles']
): Array<WNode | string> {
	if (inputValue.length === 0 && isDisabled) {
		return [wtext(styles.placeholder(), [placeholder])]
	}

	if (inputValue.length === 0) {
		// Empty input: show cursor at position 0, then placeholder
		return [
			wtext(styles.cursor(), [' ']),
			wtext(styles.placeholder(), [placeholder]),
		]
	}

	const children: Array<WNode | string> = []
	const before = inputValue.slice(0, cursorOffset)
	const after = inputValue.slice(cursorOffset)

	if (before.length > 0) {
		children.push(wtext(styles.input({ isDisabled }), [before]))
	}

	if (!isDisabled) {
		// Cursor: render character at cursor position with inverse style, or space if at end
		const cursorChar =
			cursorOffset < inputValue.length ? inputValue[cursorOffset]! : ' '
		const afterCursor =
			cursorOffset < inputValue.length ? inputValue.slice(cursorOffset + 1) : ''

		children.push(wtext(styles.cursor(), [cursorChar]))

		if (afterCursor.length > 0) {
			children.push(wtext(styles.input({ isDisabled }), [afterCursor]))
		}
	} else if (after.length > 0) {
		children.push(wtext(styles.input({ isDisabled }), [after]))
	}

	return children
}

function buildHighlightedLabel(
	label: string,
	matchRanges: IMatchRange[],
	labelProps: WNodeProps,
	highlightProps: WNodeProps
): Array<WNode | string> {
	if (matchRanges.length === 0) {
		return [wtext(labelProps, [label])]
	}

	const children: Array<WNode | string> = []
	let cursor = 0

	for (const range of matchRanges) {
		// Text before this match range
		if (cursor < range.start) {
			children.push(wtext(labelProps, [label.slice(cursor, range.start)]))
		}

		// Highlighted match
		children.push(wtext(highlightProps, [label.slice(range.start, range.end)]))
		cursor = range.end
	}

	// Remaining text after last match
	if (cursor < label.length) {
		children.push(wtext(labelProps, [label.slice(cursor)]))
	}

	return children
}
//#endregion Helpers

//#region Render
export function renderCombobox(
	state: ComboboxViewState,
	theme: ComboboxRenderTheme = defaultComboboxTheme
): WNode {
	const {
		inputValue,
		cursorOffset,
		isOpen,
		visibleOptions,
		isDisabled,
		placeholder,
		noMatchesText,
		hasScrollUp,
		hasScrollDown,
	} = state
	const { styles, config: configFn } = theme
	const config = configFn()

	const containerChildren: Array<WNode | string> = []

	// Input row: [prefix] [input with cursor]
	const inputRowChildren: Array<WNode | string> = [
		wtext(styles.prefix(), [config.prefix]),
		...buildInputNodes(
			inputValue,
			cursorOffset,
			isDisabled,
			placeholder,
			styles
		),
	]

	containerChildren.push(wbox(styles.inputRow(), inputRowChildren))

	// Dropdown
	if (isOpen && visibleOptions.length > 0) {
		const dropdownChildren: Array<WNode | string> = []

		// Scroll up indicator
		if (hasScrollUp) {
			dropdownChildren.push(
				wtext(styles.scrollIndicator(), [`${figures.arrowUp} more`])
			)
		}

		// Options
		for (const option of visibleOptions) {
			const rowChildren: Array<WNode | string> = []

			if (option.isFocused) {
				rowChildren.push(wtext(styles.focusIndicator(), [figures.pointer]))
			}

			const labelChildren = buildHighlightedLabel(
				option.label,
				option.matchRanges,
				styles.optionLabel({ isFocused: option.isFocused }),
				styles.matchHighlight()
			)

			rowChildren.push(wbox({}, labelChildren))

			dropdownChildren.push(
				wbox(
					styles.option({ isFocused: option.isFocused }),
					rowChildren,
					option.value
				)
			)
		}

		// Scroll down indicator
		if (hasScrollDown) {
			dropdownChildren.push(
				wtext(styles.scrollIndicator(), [`${figures.arrowDown} more`])
			)
		}

		containerChildren.push(wbox(styles.dropdown(), dropdownChildren))
	} else if (isOpen && visibleOptions.length === 0) {
		// No matches
		containerChildren.push(wtext(styles.noMatches(), [noMatchesText]))
	}

	return wbox(styles.container(), containerChildren)
}
//#endregion Render
