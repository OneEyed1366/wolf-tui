import { type JSX, splitProps, createMemo } from 'solid-js'
import {
	renderJsonViewer,
	defaultJsonViewerTheme,
	type JsonViewerRenderTheme,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { useJsonViewerState } from '../composables/use-json-viewer-state'
import { useJsonViewer } from '../composables/use-json-viewer'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface IJsonViewerProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Data to display. Can be any JSON-serializable value.
	 */
	data: unknown

	/**
	 * Default expand depth. Nodes at depth < this value are expanded on mount.
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
	 * Whether to sort object keys alphabetically.
	 *
	 * @default false
	 */
	sortKeys?: boolean

	/**
	 * Maximum nesting depth.
	 *
	 * @default 100
	 */
	maxDepth?: number
}
//#endregion Types

//#region Component
export function JsonViewer(props: IJsonViewerProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'data',
		'defaultExpandDepth',
		'visibleNodeCount',
		'maxStringLength',
		'sortKeys',
		'maxDepth',
	])

	const state = useJsonViewerState({
		data: local.data,
		defaultExpandDepth: local.defaultExpandDepth,
		visibleNodeCount: local.visibleNodeCount,
		maxStringLength: local.maxStringLength,
		sortKeys: local.sortKeys,
		maxDepth: local.maxDepth,
	})

	useJsonViewer({ isDisabled: () => local.isDisabled, state })

	const theme = useComponentTheme<JsonViewerRenderTheme>('JsonViewer')
	const { styles, config } = theme ?? defaultJsonViewerTheme

	const wnode = createMemo(() =>
		renderJsonViewer(
			{
				visibleNodes: state.visibleNodes(),
				hasScrollUp: state.hasScrollUp(),
				hasScrollDown: state.hasScrollDown(),
				indentWidth: state.indentWidth(),
			},
			{ styles, config }
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component

export {
	defaultJsonViewerTheme as jsonViewerTheme,
	type JsonViewerRenderTheme as JsonViewerTheme,
} from '@wolf-tui/shared'
