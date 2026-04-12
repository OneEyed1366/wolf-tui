import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	signal,
	computed,
	NgZone,
	inject,
} from '@angular/core'
import {
	filePickerReducer,
	createDefaultFilePickerState,
	readDirectory,
	formatFileSize,
	renderFilePicker,
	defaultFilePickerTheme,
	type FilePickerRenderTheme,
	type FilePickerState,
	type FilePickerAction,
	type FileTypeFilter,
	type EntryKind,
} from '@wolf-tui/shared'
import { injectInput, type Key } from '../../services/stdin.service'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'
import { THEME_CONTEXT, useComponentTheme } from '../../theme'

//#region Types
export interface FilePickerProps {
	/** Initial directory path. @default '.' */
	initialPath?: string
	/** Show hidden files (dotfiles). @default false */
	showHidden?: boolean
	/** Show file size details. @default false */
	showDetails?: boolean
	/** Enable multi-file selection. @default false */
	multiSelect?: boolean
	/** Filter by entry type: 'files', 'directories', or 'all'. @default 'all' */
	fileTypes?: FileTypeFilter
	/** Maximum visible rows before scrolling. @default 10 */
	maxHeight?: number
	/** When disabled, user input is ignored. @default false */
	isDisabled?: boolean
}
//#endregion Types

//#region FilePickerComponent
@Component({
	selector: 'w-file-picker',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePickerComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() initialPath = '.'
	@Input() showHidden = false
	@Input() showDetails = false
	@Input() multiSelect = false
	@Input() fileTypes: FileTypeFilter = 'all'
	@Input() maxHeight = 10
	@Input() set isDisabled(value: boolean) {
		this._isDisabled.set(value)
	}
	get isDisabled(): boolean {
		return this._isDisabled()
	}
	//#endregion Inputs

	//#region Outputs
	@Output() select = new EventEmitter<string[]>()
	@Output() cancel = new EventEmitter<void>()
	@Output() directoryChange = new EventEmitter<string>()
	//#endregion Outputs

	//#region Injected Dependencies
	private ngZone = inject(NgZone)
	private cdr = inject(ChangeDetectorRef)
	private globalTheme = inject(THEME_CONTEXT)
	//#endregion Injected Dependencies

	//#region Internal State
	private _isDisabled = signal(false)
	private state = signal<FilePickerState>(createDefaultFilePickerState({}))
	private previousPath = ''
	//#endregion Internal State

	//#region Computed State
	private readonly activeEntries = computed(() => {
		const s = this.state()
		return s.mode === 'filtering' ? s.filteredEntries : s.entries
	})

	private readonly visibleEntries = computed(() => {
		const s = this.state()
		const entries = this.activeEntries()

		return entries.slice(s.viewportFrom, s.viewportTo).map((entry, idx) => {
			const globalIndex = s.viewportFrom + idx
			const displayName = this.buildDisplayName(
				entry.name,
				entry.kind,
				entry.symlinkTarget,
				entry.symlinkTargetKind
			)
			return {
				name: entry.name,
				displayName,
				path: entry.path,
				kind: entry.kind,
				symlinkTargetKind: entry.symlinkTargetKind,
				symlinkTargetBasename: entry.symlinkTarget
					? (entry.symlinkTarget.split('/').pop() ?? '')
					: undefined,
				size: this.showDetails ? formatFileSize(entry.size) : '',
				isSelected: s.selectedPaths.has(entry.path),
				isFocused: globalIndex === s.focusedIndex,
			}
		})
	})

	private readonly resolvedTheme = computed(
		() =>
			useComponentTheme<FilePickerRenderTheme>(
				this.globalTheme,
				'FilePicker'
			) ?? defaultFilePickerTheme
	)

	readonly wnode = computed(() => {
		const s = this.state()
		const totalEntries = this.activeEntries().length
		return renderFilePicker(
			{
				currentPath: s.currentPath,
				visibleEntries: this.visibleEntries(),
				mode: s.mode,
				filterText: s.filterText,
				multiSelect: s.multiSelect,
				showDetails: this.showDetails,
				errorMessage: s.errorMessage,
				hasScrollUp: s.viewportFrom > 0,
				hasScrollDown: s.viewportTo < totalEntries,
				scrollUpCount: s.viewportFrom,
				scrollDownCount: totalEntries - s.viewportTo,
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
	private handleInput(input: string, key: Key): void {
		const s = this.state()

		// Filter mode handles input differently
		if (s.mode === 'filtering') {
			this.handleFilterInput(input, key)
			return
		}

		if (key.downArrow) {
			this.dispatch({ type: 'focus-next' })
			return
		}

		if (key.upArrow) {
			this.dispatch({ type: 'focus-previous' })
			return
		}

		if (key.return) {
			this.handleEnter()
			return
		}

		if (key.escape) {
			this.cancel.emit()
			return
		}

		if (key.backspace || key.leftArrow) {
			this.handleGoParent()
			return
		}

		if (key.rightArrow) {
			this.dispatch({ type: 'enter-directory' })
			this.loadCurrentDirectory()
			return
		}

		if (key.home) {
			this.dispatch({ type: 'focus-first' })
			return
		}

		if (key.end) {
			this.dispatch({ type: 'focus-last' })
			return
		}

		if (input === ' ' && s.multiSelect) {
			this.dispatch({ type: 'toggle-select' })
			return
		}

		if (input === '/') {
			this.dispatch({ type: 'enter-filter-mode' })
			return
		}
	}

	private handleFilterInput(input: string, key: Key): void {
		if (key.escape) {
			this.dispatch({ type: 'exit-filter-mode' })
			return
		}

		if (key.return) {
			this.dispatch({ type: 'exit-filter-mode' })
			return
		}

		if (key.backspace) {
			this.dispatch({ type: 'filter-delete' })
			return
		}

		if (key.downArrow) {
			this.dispatch({ type: 'focus-next' })
			return
		}

		if (key.upArrow) {
			this.dispatch({ type: 'focus-previous' })
			return
		}

		// Regular character input for filter
		if (input && !key.ctrl && !key.meta && !key.tab) {
			this.dispatch({ type: 'filter-insert', text: input })
		}
	}
	//#endregion Input Handler

	//#region State Operations
	private dispatch(action: FilePickerAction): void {
		const prev = this.state()
		const next = filePickerReducer(prev, action)
		this.state.set(next)

		// Detect directory change
		if (next.currentPath !== prev.currentPath && next.mode === 'loading') {
			this.directoryChange.emit(next.currentPath)
			this.loadCurrentDirectory()
		}
	}

	private handleEnter(): void {
		const prev = this.state()
		this.dispatch({ type: 'select' })
		const next = this.state()

		// If select resulted in navigation, loading will happen via dispatch
		if (next.mode === 'loading') return

		// Fire onSelect only on confirmation (previousSelectedPaths change), not every toggle
		if (
			next.previousSelectedPaths !== prev.previousSelectedPaths &&
			next.selectedPaths.size > 0
		) {
			this.select.emit([...next.selectedPaths])
		}
	}

	private handleGoParent(): void {
		this.dispatch({ type: 'go-parent' })
	}
	//#endregion State Operations

	//#region Directory Loading
	private loadCurrentDirectory(): void {
		const path = this.state().currentPath

		this.ngZone.runOutsideAngular(() => {
			readDirectory(path, { showHidden: this.showHidden }).then(
				(entries) => {
					this.ngZone.run(() => {
						this.dispatch({ type: 'set-entries', path, entries })
						this.cdr.detectChanges()
					})
				},
				(err: unknown) => {
					const message =
						err instanceof Error ? err.message : 'Failed to read directory'
					this.ngZone.run(() => {
						this.dispatch({ type: 'set-error', error: message })
						this.cdr.detectChanges()
					})
				}
			)
		})
	}
	//#endregion Directory Loading

	//#region Helpers
	private buildDisplayName(
		name: string,
		kind: EntryKind,
		symlinkTarget: string | undefined,
		symlinkTargetKind: EntryKind | undefined
	): string {
		let display = name
		if (kind === 'directory') {
			display += '/'
		}
		if (kind === 'symlink' && symlinkTarget) {
			const targetBase = symlinkTarget.split('/').pop() ?? symlinkTarget
			const suffix = symlinkTargetKind === 'directory' ? '/' : ''
			display += ` -> ${targetBase}${suffix}`
		}
		return display
	}
	//#endregion Helpers

	//#region Lifecycle
	ngOnInit(): void {
		this.initializeState()
		this.loadCurrentDirectory()
	}

	ngOnDestroy(): void {}

	ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
		if (
			changes['initialPath'] ||
			changes['multiSelect'] ||
			changes['fileTypes'] ||
			changes['showHidden'] ||
			changes['showDetails'] ||
			changes['maxHeight']
		) {
			this.initializeState()
			this.loadCurrentDirectory()
		}
	}

	private initializeState(): void {
		this.state.set(
			createDefaultFilePickerState({
				initialPath: this.initialPath,
				multiSelect: this.multiSelect,
				fileTypes: this.fileTypes,
				showHidden: this.showHidden,
				showDetails: this.showDetails,
				maxHeight: this.maxHeight,
			})
		)
		this.previousPath = this.initialPath
	}
	//#endregion Lifecycle
}
//#endregion FilePickerComponent
