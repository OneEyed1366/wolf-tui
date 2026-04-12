import {
	defineComponent,
	toRef,
	type PropType,
	type DefineComponent,
} from 'vue'
import {
	renderTreeView,
	defaultTreeViewTheme,
	type TreeViewRenderTheme,
	type TreeViewSelectionMode,
	type ITreeNode,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { useTreeViewState } from '../composables/use-tree-view-state'
import { useTreeView } from '../composables/use-tree-view'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface TreeViewProps {
	/**
	 * Tree data.
	 */
	data: ITreeNode[]

	/**
	 * Selection mode: 'none' | 'single' | 'multiple'.
	 *
	 * @default 'none'
	 */
	selectionMode?: TreeViewSelectionMode

	/**
	 * Default expanded node IDs.
	 */
	defaultExpanded?: ReadonlySet<string> | 'all'

	/**
	 * Default selected node IDs.
	 */
	defaultSelected?: ReadonlySet<string>

	/**
	 * Number of visible nodes.
	 *
	 * @default 10
	 */
	visibleNodeCount?: number

	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Callback when selection changes.
	 */
	onSelect?: (selectedIds: ReadonlySet<string>) => void

	/**
	 * Callback when focused node changes.
	 */
	onFocusChange?: (focusedId: string | undefined) => void

	/**
	 * Callback to load children for a node (async tree).
	 */
	loadChildren?: (nodeId: string) => Promise<ITreeNode[]>
}
//#endregion Types

//#region Component
export const TreeView: DefineComponent<TreeViewProps> = defineComponent({
	name: 'TreeView',
	props: {
		data: {
			type: Array as PropType<ITreeNode[]>,
			required: true,
		},
		selectionMode: {
			type: String as PropType<TreeViewSelectionMode>,
			default: 'none',
		},
		defaultExpanded: {
			type: [Object, String] as PropType<ReadonlySet<string> | 'all'>,
			default: undefined,
		},
		defaultSelected: {
			type: Object as PropType<ReadonlySet<string>>,
			default: undefined,
		},
		visibleNodeCount: {
			type: Number,
			default: 10,
		},
		isDisabled: {
			type: Boolean,
			default: false,
		},
		onSelect: {
			type: Function as PropType<(selectedIds: ReadonlySet<string>) => void>,
			default: undefined,
		},
		onFocusChange: {
			type: Function as PropType<(focusedId: string | undefined) => void>,
			default: undefined,
		},
		loadChildren: {
			type: Function as PropType<(nodeId: string) => Promise<ITreeNode[]>>,
			default: undefined,
		},
	},
	setup(props) {
		const state = useTreeViewState({
			data: () => props.data,
			selectionMode: props.selectionMode,
			defaultExpanded: props.defaultExpanded,
			defaultSelected: props.defaultSelected,
			visibleNodeCount: props.visibleNodeCount,
			onSelect: props.onSelect,
			onFocusChange: props.onFocusChange,
			loadChildren: props.loadChildren,
		})

		useTreeView({ isDisabled: toRef(props, 'isDisabled'), state })

		const theme = useComponentTheme<TreeViewRenderTheme>('TreeView')
		const { styles, config } = theme ?? defaultTreeViewTheme

		return () => {
			return wNodeToVue(
				renderTreeView(
					{
						visibleNodes: state.viewportNodes.value,
						selectionMode: state.selectionMode,
						hasScrollUp: state.hasScrollUp.value,
						hasScrollDown: state.hasScrollDown.value,
						scrollUpCount: state.scrollUpCount.value,
						scrollDownCount: state.scrollDownCount.value,
					},
					{ styles, config }
				)
			)
		}
	},
})
//#endregion Component

export {
	defaultTreeViewTheme as treeViewTheme,
	type TreeViewRenderTheme as TreeViewTheme,
}
export type { TreeViewProps as Props, TreeViewProps as IProps }
