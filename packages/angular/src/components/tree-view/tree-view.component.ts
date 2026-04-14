import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	signal,
	computed,
	inject,
} from '@angular/core'
import {
	treeViewReducer,
	createDefaultTreeViewState,
	renderTreeView,
	defaultTreeViewTheme,
	type TreeViewRenderTheme,
	type TreeViewState,
	type TreeViewAction,
	type TreeViewSelectionMode,
	type ITreeNode,
	type ITreeNodeState,
} from '@wolf-tui/shared'
import { injectInput, type Key } from '../../services/stdin.service'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'
import { THEME_CONTEXT, useComponentTheme } from '../../theme'

//#region Types
export interface TreeViewProps<T = Record<string, unknown>> {
	/** Tree data nodes. */
	data: ITreeNode<T>[]
	/** Selection behavior: 'none', 'single', or 'multiple'. @default 'none' */
	selectionMode?: TreeViewSelectionMode
	/** Node IDs to expand by default, or 'all'. @default new Set() */
	defaultExpanded?: ReadonlySet<string> | 'all'
	/** Node IDs selected by default. @default new Set() */
	defaultSelected?: ReadonlySet<string>
	/** Number of visible rows before scrolling. @default Infinity */
	visibleNodeCount?: number
	/** When disabled, user input is ignored. @default false */
	isDisabled?: boolean
	/** Async loader for lazy children. */
	loadChildren?: (nodeId: string) => Promise<ITreeNode<T>[]>
}
//#endregion Types

//#region TreeViewComponent
@Component({
	selector: 'w-tree-view',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeViewComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() data: ITreeNode[] = []
	@Input() selectionMode: TreeViewSelectionMode = 'none'
	@Input() defaultExpanded: ReadonlySet<string> | 'all' = new Set()
	@Input() defaultSelected: ReadonlySet<string> = new Set()
	@Input() visibleNodeCount = Infinity
	@Input() set isDisabled(value: boolean) {
		this._isDisabled.set(value)
	}
	get isDisabled(): boolean {
		return this._isDisabled()
	}
	@Input() loadChildren?: (nodeId: string) => Promise<ITreeNode[]>
	//#endregion Inputs

	//#region Outputs
	@Output() focusChange = new EventEmitter<string | undefined>()
	@Output() expandChange = new EventEmitter<ReadonlySet<string>>()
	@Output() selectChange = new EventEmitter<ReadonlySet<string>>()
	//#endregion Outputs

	//#region Injected Dependencies
	private globalTheme = inject(THEME_CONTEXT)
	//#endregion Injected Dependencies

	//#region Internal State
	private _isDisabled = signal(false)
	private state = signal<TreeViewState>(
		createDefaultTreeViewState({ data: [] })
	)
	//#endregion Internal State

	//#region Computed State
	private readonly visibleNodes = computed(() => {
		const s = this.state()
		const {
			flatNodes,
			viewport,
			expandedIds,
			selectedIds,
			loadingIds,
			focusedId,
		} = s

		return flatNodes.slice(viewport.fromIndex, viewport.toIndex).map((flat) => {
			const nodeState: ITreeNodeState = {
				isFocused: flat.node.id === focusedId,
				isExpanded: expandedIds.has(flat.node.id),
				isSelected: selectedIds.has(flat.node.id),
				isLoading: loadingIds.has(flat.node.id),
				depth: flat.depth,
				hasChildren: flat.hasChildren,
			}
			return {
				id: flat.node.id,
				label: flat.node.label,
				state: nodeState,
			}
		})
	})

	private readonly scrollInfo = computed(() => {
		const s = this.state()
		const { flatNodes, viewport } = s
		const hasScrollUp = viewport.fromIndex > 0
		const hasScrollDown = viewport.toIndex < flatNodes.length
		const scrollUpCount = viewport.fromIndex
		const scrollDownCount = flatNodes.length - viewport.toIndex
		return { hasScrollUp, hasScrollDown, scrollUpCount, scrollDownCount }
	})

	private readonly resolvedTheme = computed(
		() =>
			useComponentTheme<TreeViewRenderTheme>(this.globalTheme, 'TreeView') ??
			defaultTreeViewTheme
	)

	readonly wnode = computed(() => {
		const scroll = this.scrollInfo()
		return renderTreeView(
			{
				visibleNodes: this.visibleNodes(),
				selectionMode: this.state().selectionMode,
				hasScrollUp: scroll.hasScrollUp,
				hasScrollDown: scroll.hasScrollDown,
				scrollUpCount: scroll.scrollUpCount,
				scrollDownCount: scroll.scrollDownCount,
			},
			this.resolvedTheme()
		)
	})
	//#endregion Computed State

	//#region Constructor
	constructor() {
		injectInput((input: string, key: Key) => this.handleInput(input, key), {
			isActive: () => !this._isDisabled(),
		})
	}
	//#endregion Constructor

	//#region Input Handler
	private handleInput(_input: string, key: Key): void {
		if (key.downArrow) {
			this.dispatch({ type: 'focus-next' })
		}

		if (key.upArrow) {
			this.dispatch({ type: 'focus-previous' })
		}

		if (key.rightArrow) {
			this.handleExpand()
		}

		if (key.leftArrow) {
			this.dispatch({ type: 'collapse' })
		}

		if (key.return || _input === ' ') {
			this.dispatch({ type: 'select' })
		}

		if (key.home) {
			this.dispatch({ type: 'focus-first' })
		}

		if (key.end) {
			this.dispatch({ type: 'focus-last' })
		}
	}
	//#endregion Input Handler

	//#region State Operations
	private dispatch(action: TreeViewAction): void {
		const prev = this.state()
		const next = treeViewReducer(prev, action)
		this.state.set(next)

		if (next.focusedId !== prev.focusedId) {
			this.focusChange.emit(next.focusedId)
		}

		if (next.expandedIds !== prev.expandedIds) {
			this.expandChange.emit(next.expandedIds)
		}

		if (next.selectedIds !== prev.selectedIds) {
			this.selectChange.emit(next.selectedIds)
		}
	}

	private handleExpand(): void {
		const s = this.state()
		if (s.focusedId === undefined) return

		// If already expanded, move to first child
		if (s.expandedIds.has(s.focusedId)) {
			this.dispatch({ type: 'focus-first-child' })
			return
		}

		// Check if node needs lazy loading
		const flat = s.flatNodes.find((n) => n.node.id === s.focusedId)
		if (!flat) return

		if (
			flat.node.isParent === true &&
			(!flat.node.children || flat.node.children.length === 0) &&
			this.loadChildren
		) {
			this.loadChildrenAsync(s.focusedId)
			return
		}

		this.dispatch({ type: 'expand' })
	}

	private loadChildrenAsync(nodeId: string): void {
		if (!this.loadChildren) return

		this.dispatch({ type: 'set-loading', nodeId, isLoading: true })

		this.loadChildren(nodeId).then(
			(children) => {
				this.dispatch({ type: 'set-loading', nodeId, isLoading: false })
				this.dispatch({ type: 'set-children', nodeId, children })
				this.dispatch({ type: 'expand-node', nodeId })
			},
			() => {
				this.dispatch({ type: 'set-loading', nodeId, isLoading: false })
			}
		)
	}
	//#endregion State Operations

	//#region Lifecycle
	ngOnInit(): void {
		this.initializeState()
	}

	ngOnDestroy(): void {}

	ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
		if (
			changes['data'] ||
			changes['selectionMode'] ||
			changes['defaultExpanded'] ||
			changes['defaultSelected'] ||
			changes['visibleNodeCount']
		) {
			this.initializeState()
		}
	}

	private initializeState(): void {
		this.state.set(
			createDefaultTreeViewState({
				data: this.data,
				selectionMode: this.selectionMode,
				defaultExpanded: this.defaultExpanded,
				defaultSelected: this.defaultSelected,
				visibleNodeCount: this.visibleNodeCount,
			})
		)
	}
	//#endregion Lifecycle
}
//#endregion TreeViewComponent
