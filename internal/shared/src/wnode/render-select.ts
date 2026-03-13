import figures from 'figures'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { SelectViewState } from './view-states'

//#region Theme
export type SelectRenderTheme = {
	styles: {
		container: () => WNodeProps
		option: (props: { isFocused: boolean }) => WNodeProps
		selectedIndicator: () => WNodeProps
		focusIndicator: () => WNodeProps
		label: (props: { isFocused: boolean; isSelected: boolean }) => WNodeProps
		highlightedText: () => WNodeProps
	}
}

export const defaultSelectTheme: SelectRenderTheme = {
	styles: {
		container: (): WNodeProps => ({ style: { flexDirection: 'column' } }),
		option: ({ isFocused }): WNodeProps => ({
			style: { gap: 1, paddingLeft: isFocused ? 0 : 2 },
		}),
		selectedIndicator: (): WNodeProps => ({ style: { color: 'green' } }),
		focusIndicator: (): WNodeProps => ({ style: { color: 'blue' } }),
		label: ({ isFocused, isSelected }): WNodeProps => {
			let color: string | undefined
			if (isSelected) color = 'green'
			if (isFocused) color = 'blue'
			return { style: { color } }
		},
		highlightedText: (): WNodeProps => ({ style: { fontWeight: 'bold' } }),
	},
}
//#endregion Theme

//#region Helpers
function buildLabelChildren(
	label: string,
	highlightText: string | undefined,
	highlightedTextProps: WNodeProps
): Array<WNode | string> {
	if (highlightText && label.includes(highlightText)) {
		const idx = label.indexOf(highlightText)
		return [
			label.slice(0, idx),
			wtext(highlightedTextProps, [highlightText]),
			label.slice(idx + highlightText.length),
		]
	}
	return [label]
}
//#endregion Helpers

//#region Render
export function renderSelect(
	state: SelectViewState,
	theme: SelectRenderTheme = defaultSelectTheme
): WNode {
	const { visibleOptions, focusedValue, value, isDisabled, highlightText } =
		state
	const { styles } = theme

	const optionNodes = visibleOptions.map((option) => {
		const isFocused = !isDisabled && focusedValue === option.value
		const isSelected = value === option.value

		const labelChildren = buildLabelChildren(
			option.label,
			highlightText,
			styles.highlightedText()
		)

		const rowChildren: Array<WNode | string> = []
		if (isFocused) {
			rowChildren.push(wtext(styles.focusIndicator(), [figures.pointer]))
		}
		rowChildren.push(
			wtext(styles.label({ isFocused, isSelected }), labelChildren)
		)
		if (isSelected) {
			rowChildren.push(wtext(styles.selectedIndicator(), [figures.tick]))
		}

		return wbox(styles.option({ isFocused }), rowChildren, option.value)
	})

	return wbox(styles.container(), optionNodes)
}
//#endregion Render
