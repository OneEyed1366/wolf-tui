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
	jsonViewerReducer,
	createDefaultJsonViewerState,
	renderJsonViewer,
	defaultJsonViewerTheme,
	resolvePathValue,
	type JsonViewerRenderTheme,
	type JsonViewerState,
	type JsonViewerAction,
} from '@wolf-tui/shared'
import { injectInput, type Key } from '../../services/stdin.service'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'
import { THEME_CONTEXT, useComponentTheme } from '../../theme'

//#region Types
export interface JsonViewerProps {
	/** JSON-serializable data to display. */
	data: unknown
	/** Number of nesting levels to expand by default. @default 1 */
	defaultExpandDepth?: number
	/** Number of visible rows before scrolling. @default 20 */
	visibleNodeCount?: number
	/** Maximum string length before truncation. @default 120 */
	maxStringLength?: number
	/** Sort object keys alphabetically. @default false */
	sortKeys?: boolean
	/** When disabled, user input is ignored. @default false */
	isDisabled?: boolean
}
//#endregion Types

//#region JsonViewerComponent
@Component({
	selector: 'w-json-viewer',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonViewerComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() data: unknown = null
	@Input() defaultExpandDepth = 1
	@Input() visibleNodeCount = 20
	@Input() maxStringLength = 120
	@Input() sortKeys = false
	@Input() set isDisabled(value: boolean) {
		this._isDisabled.set(value)
	}
	get isDisabled(): boolean {
		return this._isDisabled()
	}
	//#endregion Inputs

	//#region Outputs
	@Output() select = new EventEmitter<{ path: string; value: unknown }>()
	//#endregion Outputs

	//#region Injected Dependencies
	private globalTheme = inject(THEME_CONTEXT)
	//#endregion Injected Dependencies

	//#region Internal State
	private _isDisabled = signal(false)
	private state = signal<JsonViewerState>(
		createDefaultJsonViewerState({ data: null })
	)
	//#endregion Internal State

	//#region Computed State
	private readonly visibleNodes = computed(() => {
		const s = this.state()
		const { nodes, viewport, focusedIndex, expandedIds } = s

		return nodes
			.slice(viewport.fromIndex, viewport.toIndex)
			.map((node, idx) => ({
				node,
				isFocused: viewport.fromIndex + idx === focusedIndex,
				isExpanded: expandedIds.has(node.id),
			}))
	})

	private readonly resolvedTheme = computed(
		() =>
			useComponentTheme<JsonViewerRenderTheme>(
				this.globalTheme,
				'JsonViewer'
			) ?? defaultJsonViewerTheme
	)

	readonly wnode = computed(() => {
		const s = this.state()
		return renderJsonViewer(
			{
				visibleNodes: this.visibleNodes(),
				hasScrollUp: s.viewport.fromIndex > 0,
				hasScrollDown: s.viewport.toIndex < s.nodes.length,
				indentWidth: 2,
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
			this.dispatch({ type: 'expand' })
		}

		if (key.leftArrow) {
			this.dispatch({ type: 'collapse' })
		}

		if (key.return) {
			this.handleSelect()
		}

		if (_input === ' ') {
			this.dispatch({ type: 'toggle-expand' })
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
	private dispatch(action: JsonViewerAction): void {
		const next = jsonViewerReducer(this.state(), action)
		this.state.set(next)
	}

	private handleSelect(): void {
		const s = this.state()
		const focused = s.nodes[s.focusedIndex]
		if (focused && !focused.isClosingBracket) {
			this.dispatch({ type: 'toggle-expand' })
			const actualValue = resolvePathValue(s.data, focused.id)
			this.select.emit({ path: focused.id, value: actualValue })
		}
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
			changes['defaultExpandDepth'] ||
			changes['visibleNodeCount'] ||
			changes['maxStringLength'] ||
			changes['sortKeys']
		) {
			this.initializeState()
		}
	}

	private initializeState(): void {
		this.state.set(
			createDefaultJsonViewerState({
				data: this.data,
				defaultExpandDepth: this.defaultExpandDepth,
				visibleNodeCount: this.visibleNodeCount,
				maxStringLength: this.maxStringLength,
				sortKeys: this.sortKeys,
			})
		)
	}
	//#endregion Lifecycle
}
//#endregion JsonViewerComponent
