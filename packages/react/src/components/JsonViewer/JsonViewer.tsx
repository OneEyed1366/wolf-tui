import {
	renderJsonViewer,
	defaultJsonViewerTheme,
	type JsonViewerRenderTheme,
	type JsonViewerVisibleNode,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../../theme/theme'
import { useJsonViewerState } from './use-json-viewer-state'
import { useJsonViewer } from './use-json-viewer'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type IJsonViewerProps = {
	/**
	 * Data to display. Accepts any JSON-serializable value.
	 */
	data: unknown

	/**
	 * Depth to expand by default.
	 *
	 * @default 1
	 */
	defaultExpandDepth?: number

	/**
	 * Number of visible nodes in the viewport.
	 *
	 * @default 20
	 */
	visibleNodeCount?: number

	/**
	 * Maximum string length before truncation.
	 *
	 * @default 120
	 */
	maxStringLength?: number

	/**
	 * Sort object keys alphabetically.
	 *
	 * @default false
	 */
	sortKeys?: boolean

	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Callback when a node is selected (Enter key).
	 */
	onSelect?: (path: string, value: unknown) => void
}
//#endregion Types

//#region Component
export function JsonViewer({
	data,
	defaultExpandDepth = 1,
	visibleNodeCount = 20,
	maxStringLength = 120,
	sortKeys = false,
	isDisabled = false,
	onSelect,
}: IJsonViewerProps) {
	const state = useJsonViewerState({
		data,
		defaultExpandDepth,
		visibleNodeCount,
		maxStringLength,
		sortKeys,
		onSelect,
	})

	useJsonViewer({ isDisabled, onSelect, state })

	const theme = useComponentTheme<JsonViewerRenderTheme>('JsonViewer')
	const resolvedTheme = theme ?? defaultJsonViewerTheme

	const totalNodes = state.nodes.length
	const hasScrollUp = state.viewportFrom > 0
	const hasScrollDown = state.viewportTo < totalNodes

	const visibleNodes: JsonViewerVisibleNode[] = state.visibleNodes.map(
		(node, index) => ({
			node,
			isFocused: state.viewportFrom + index === state.focusedIndex,
			isExpanded: state.expandedIds.has(node.id),
		})
	)

	return wNodeToReact(
		renderJsonViewer(
			{
				visibleNodes,
				hasScrollUp,
				hasScrollDown,
				indentWidth: 2,
			},
			resolvedTheme
		)
	)
}
//#endregion Component
