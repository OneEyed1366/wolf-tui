import figures from 'figures'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { IJsonNode } from '../state/json-viewer'

//#region ViewState
export type JsonViewerVisibleNode = {
	node: IJsonNode
	isFocused: boolean
	isExpanded: boolean
}

export type JsonViewerViewState = {
	visibleNodes: JsonViewerVisibleNode[]
	hasScrollUp: boolean
	hasScrollDown: boolean
	indentWidth: number
}
//#endregion ViewState

//#region Theme
export type JsonViewerRenderTheme = {
	styles: {
		container: () => WNodeProps
		row: (props: { isFocused: boolean; depth: number }) => WNodeProps
		indent: () => WNodeProps
		focusIndicator: () => WNodeProps
		expandIcon: (props: { isExpanded: boolean }) => WNodeProps
		key: (props: { depth: number }) => WNodeProps
		colon: () => WNodeProps
		value: (props: { valueType: string }) => WNodeProps
		preview: () => WNodeProps
		scrollIndicator: () => WNodeProps
	}
	config: () => {
		expandedIcon: string
		collapsedIcon: string
		colonSeparator: string
	}
}

export const defaultJsonViewerTheme: JsonViewerRenderTheme = {
	styles: {
		container: (): WNodeProps => ({ style: { flexDirection: 'column' } }),
		row: ({ isFocused }): WNodeProps => ({
			style: { gap: 1, paddingLeft: isFocused ? 0 : 2 },
		}),
		indent: (): WNodeProps => ({ style: {} }),
		focusIndicator: (): WNodeProps => ({ style: { color: 'blue' } }),
		expandIcon: (): WNodeProps => ({ style: { color: 'gray' } }),
		key: (): WNodeProps => ({ style: { color: 'cyan' } }),
		colon: (): WNodeProps => ({ style: { dimColor: true } }),
		value: ({ valueType }): WNodeProps => {
			switch (valueType) {
				case 'string':
					return { style: { color: 'green' } }
				case 'number':
				case 'bigint':
					return { style: { color: 'yellow' } }
				case 'boolean':
					return { style: { color: 'magenta' } }
				case 'null':
				case 'undefined':
					return { style: { dimColor: true } }
				case 'date':
					return { style: { color: 'cyan' } }
				case 'regexp':
					return { style: { color: 'red' } }
				case 'symbol':
					return { style: { color: 'magenta' } }
				case 'function':
					return { style: { color: 'blue' } }
				case 'circular':
				case 'max-depth':
					return { style: { color: 'red', dimColor: true } }
				default:
					return { style: { dimColor: true } }
			}
		},
		preview: (): WNodeProps => ({ style: { dimColor: true } }),
		scrollIndicator: (): WNodeProps => ({
			style: { color: 'gray', dimColor: true },
		}),
	},
	config: () => ({
		expandedIcon: figures.triangleDown,
		collapsedIcon: figures.triangleRight,
		colonSeparator: ':',
	}),
}
//#endregion Theme

//#region Helpers
function buildIndent(depth: number, indentWidth: number): string {
	return ' '.repeat(depth * indentWidth)
}

const SIMPLE_IDENTIFIER_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

function formatKey(key: string): string {
	if (SIMPLE_IDENTIFIER_RE.test(key)) {
		return key
	}
	const escaped = key
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/\t/g, '\\t')
	return `"${escaped}"`
}
//#endregion Helpers

//#region Render
export function renderJsonViewer(
	state: JsonViewerViewState,
	theme: JsonViewerRenderTheme = defaultJsonViewerTheme
): WNode {
	const { visibleNodes, hasScrollUp, hasScrollDown, indentWidth } = state
	const { styles, config: configFn } = theme
	const config = configFn()

	const children: Array<WNode | string> = []

	// Scroll up indicator
	if (hasScrollUp) {
		children.push(wtext(styles.scrollIndicator(), [`${figures.arrowUp} more`]))
	}

	// Visible nodes
	for (const visibleNode of visibleNodes) {
		const { node, isFocused, isExpanded } = visibleNode
		const rowChildren: Array<WNode | string> = []

		// Closing bracket rows — render just the bracket with indent
		if (node.isClosingBracket) {
			if (node.depth > 0) {
				rowChildren.push(
					wtext(styles.indent(), [buildIndent(node.depth, indentWidth)])
				)
			}
			rowChildren.push(wtext(styles.preview(), [node.bracketChar]))
			children.push(
				wbox(
					styles.row({ isFocused: false, depth: node.depth }),
					rowChildren,
					node.id
				)
			)
			continue
		}

		// Focus indicator
		if (isFocused) {
			rowChildren.push(wtext(styles.focusIndicator(), [figures.pointer]))
		}

		// Indent
		if (node.depth > 0) {
			rowChildren.push(
				wtext(styles.indent(), [buildIndent(node.depth, indentWidth)])
			)
		}

		// Expand/collapse icon for expandable nodes
		if (node.isExpandable) {
			const icon = isExpanded ? config.expandedIcon : config.collapsedIcon
			rowChildren.push(wtext(styles.expandIcon({ isExpanded }), [icon]))
		}

		// Key (skip for root node)
		if (node.id !== '$') {
			rowChildren.push(
				wtext(styles.key({ depth: node.depth }), [formatKey(node.key)])
			)
			rowChildren.push(wtext(styles.colon(), [config.colonSeparator]))
		}

		// Value or preview for containers
		if (node.hasChildren) {
			rowChildren.push(wtext(styles.preview(), [node.displayValue]))
		} else {
			rowChildren.push(
				wtext(styles.value({ valueType: node.valueType }), [node.displayValue])
			)
		}

		children.push(
			wbox(styles.row({ isFocused, depth: node.depth }), rowChildren, node.id)
		)
	}

	// Scroll down indicator
	if (hasScrollDown) {
		children.push(
			wtext(styles.scrollIndicator(), [`${figures.arrowDown} more`])
		)
	}

	return wbox(styles.container(), children)
}
//#endregion Render
