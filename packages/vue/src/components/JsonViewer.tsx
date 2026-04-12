import {
	defineComponent,
	toRef,
	type PropType,
	type DefineComponent,
} from 'vue'
import {
	renderJsonViewer,
	defaultJsonViewerTheme,
	type JsonViewerRenderTheme,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { useJsonViewerState } from '../composables/use-json-viewer-state'
import { useJsonViewer } from '../composables/use-json-viewer'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface JsonViewerProps {
	/**
	 * JSON data to display.
	 */
	data: unknown

	/**
	 * Default depth to expand on mount.
	 *
	 * @default 1
	 */
	defaultExpandDepth?: number

	/**
	 * Number of visible rows.
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
	 * Maximum nesting depth.
	 *
	 * @default 100
	 */
	maxDepth?: number

	/**
	 * Indent width (spaces per depth level).
	 *
	 * @default 2
	 */
	indentWidth?: number

	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Callback when focused node changes.
	 */
	onFocusChange?: (nodeId: string | undefined) => void
}
//#endregion Types

//#region Component
export const JsonViewer: DefineComponent<JsonViewerProps> = defineComponent({
	name: 'JsonViewer',
	props: {
		data: {
			type: [Object, Array, String, Number, Boolean] as PropType<unknown>,
			required: true,
		},
		defaultExpandDepth: {
			type: Number,
			default: 1,
		},
		visibleNodeCount: {
			type: Number,
			default: 20,
		},
		maxStringLength: {
			type: Number,
			default: 120,
		},
		sortKeys: {
			type: Boolean,
			default: false,
		},
		maxDepth: {
			type: Number,
			default: 100,
		},
		indentWidth: {
			type: Number,
			default: 2,
		},
		isDisabled: {
			type: Boolean,
			default: false,
		},
		onFocusChange: {
			type: Function as PropType<(nodeId: string | undefined) => void>,
			default: undefined,
		},
	},
	setup(props) {
		const state = useJsonViewerState({
			data: props.data,
			defaultExpandDepth: props.defaultExpandDepth,
			visibleNodeCount: props.visibleNodeCount,
			maxStringLength: props.maxStringLength,
			sortKeys: props.sortKeys,
			maxDepth: props.maxDepth,
			indentWidth: props.indentWidth,
			onFocusChange: props.onFocusChange,
		})

		useJsonViewer({ isDisabled: toRef(props, 'isDisabled'), state })

		const theme = useComponentTheme<JsonViewerRenderTheme>('JsonViewer')
		const { styles, config } = theme ?? defaultJsonViewerTheme

		return () => {
			return wNodeToVue(
				renderJsonViewer(
					{
						visibleNodes: state.visibleNodes.value,
						hasScrollUp: state.hasScrollUp.value,
						hasScrollDown: state.hasScrollDown.value,
						indentWidth: state.indentWidth,
					},
					{ styles, config }
				)
			)
		}
	},
})
//#endregion Component

export {
	defaultJsonViewerTheme as jsonViewerTheme,
	type JsonViewerRenderTheme as JsonViewerTheme,
}
export type { JsonViewerProps as Props, JsonViewerProps as IProps }
