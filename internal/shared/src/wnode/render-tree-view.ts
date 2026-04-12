import figures from 'figures'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { ITreeNodeState } from '../lib/tree-utils'
import type { TreeViewSelectionMode } from '../state/tree-view'

//#region Types
export type TreeViewVisibleNode = {
	id: string
	label: string
	state: ITreeNodeState
}

export type TreeViewViewState = {
	visibleNodes: TreeViewVisibleNode[]
	selectionMode: TreeViewSelectionMode
	hasScrollUp: boolean
	hasScrollDown: boolean
	scrollUpCount: number
	scrollDownCount: number
}
//#endregion Types

//#region Theme
export type TreeViewRenderTheme = {
	styles: {
		container: () => WNodeProps
		node: (props: { isFocused: boolean; depth: number }) => WNodeProps
		indent: () => WNodeProps
		expandIcon: (props: {
			isExpanded: boolean
			hasChildren: boolean
			isLoading: boolean
		}) => WNodeProps
		checkbox: (props: { isSelected: boolean }) => WNodeProps
		label: (props: { isFocused: boolean; isSelected: boolean }) => WNodeProps
		focusIndicator: () => WNodeProps
		scrollIndicator: () => WNodeProps
	}
	config: () => {
		expandedIcon: string
		collapsedIcon: string
		leafIcon: string
		loadingIcon: string
		checkedIcon: string
		uncheckedIcon: string
		tickIcon: string
	}
}

export const defaultTreeViewTheme: TreeViewRenderTheme = {
	styles: {
		container: (): WNodeProps => ({ style: { flexDirection: 'column' } }),
		node: ({ isFocused }): WNodeProps => ({
			style: { gap: 1, paddingLeft: isFocused ? 0 : 2 },
		}),
		indent: (): WNodeProps => ({}),
		expandIcon: (): WNodeProps => ({ style: { color: 'gray' } }),
		checkbox: ({ isSelected }): WNodeProps => ({
			style: { color: isSelected ? 'green' : 'gray' },
		}),
		label: ({ isFocused, isSelected }): WNodeProps => {
			let color: string | undefined
			if (isSelected) color = 'green'
			if (isFocused) color = 'blue'
			return { style: { color } }
		},
		focusIndicator: (): WNodeProps => ({ style: { color: 'blue' } }),
		scrollIndicator: (): WNodeProps => ({
			style: { color: 'gray', dimColor: true },
		}),
	},
	config: () => ({
		expandedIcon: figures.triangleDown,
		collapsedIcon: figures.triangleRight,
		leafIcon: ' ',
		loadingIcon: figures.ellipsis,
		checkedIcon: '[x]',
		uncheckedIcon: '[ ]',
		tickIcon: figures.tick,
	}),
}
//#endregion Theme

//#region Helpers
function buildIndent(depth: number): string {
	return '  '.repeat(depth)
}

function getExpandIcon(
	config: ReturnType<TreeViewRenderTheme['config']>,
	nodeState: ITreeNodeState
): string {
	if (nodeState.isLoading) return config.loadingIcon
	if (!nodeState.hasChildren) return config.leafIcon
	return nodeState.isExpanded ? config.expandedIcon : config.collapsedIcon
}
//#endregion Helpers

//#region Render
export function renderTreeView(
	state: TreeViewViewState,
	theme: TreeViewRenderTheme = defaultTreeViewTheme
): WNode {
	const {
		visibleNodes,
		selectionMode,
		hasScrollUp,
		hasScrollDown,
		scrollUpCount,
		scrollDownCount,
	} = state
	const { styles, config: configFn } = theme
	const config = configFn()

	const children: Array<WNode | string> = []

	// Scroll up indicator
	if (hasScrollUp) {
		children.push(
			wtext(styles.scrollIndicator(), [
				`${figures.arrowUp} ${scrollUpCount} more`,
			])
		)
	}

	// Visible nodes
	for (const visibleNode of visibleNodes) {
		const { id, label, state: nodeState } = visibleNode
		const rowChildren: Array<WNode | string> = []

		// Focus indicator
		if (nodeState.isFocused) {
			rowChildren.push(wtext(styles.focusIndicator(), [figures.pointer]))
		}

		// Indent
		if (nodeState.depth > 0) {
			rowChildren.push(wtext(styles.indent(), [buildIndent(nodeState.depth)]))
		}

		// Expand/collapse icon
		const expandIconStr = getExpandIcon(config, nodeState)
		rowChildren.push(
			wtext(
				styles.expandIcon({
					isExpanded: nodeState.isExpanded,
					hasChildren: nodeState.hasChildren,
					isLoading: nodeState.isLoading,
				}),
				[expandIconStr]
			)
		)

		// Checkbox (multiple selection mode only)
		if (selectionMode === 'multiple') {
			const checkboxStr = nodeState.isSelected
				? config.checkedIcon
				: config.uncheckedIcon
			rowChildren.push(
				wtext(styles.checkbox({ isSelected: nodeState.isSelected }), [
					checkboxStr,
				])
			)
		}

		// Label
		rowChildren.push(
			wtext(
				styles.label({
					isFocused: nodeState.isFocused,
					isSelected: nodeState.isSelected,
				}),
				[label]
			)
		)

		// Single-select tick indicator
		if (selectionMode === 'single' && nodeState.isSelected) {
			rowChildren.push(
				wtext(styles.checkbox({ isSelected: true }), [` ${config.tickIcon}`])
			)
		}

		children.push(
			wbox(
				styles.node({ isFocused: nodeState.isFocused, depth: nodeState.depth }),
				rowChildren,
				id
			)
		)
	}

	// Scroll down indicator
	if (hasScrollDown) {
		children.push(
			wtext(styles.scrollIndicator(), [
				`${figures.arrowDown} ${scrollDownCount} more`,
			])
		)
	}

	return wbox(styles.container(), children)
}
//#endregion Render
