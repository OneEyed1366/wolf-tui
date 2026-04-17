import type { AfterViewInit, OnChanges, OnDestroy, OnInit } from '@angular/core'
import {
	Component,
	ChangeDetectionStrategy,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	ViewChild,
	computed,
	signal,
} from '@angular/core'
import type { DOMElement, Styles } from '@wolf-tui/core'
import { measureElement } from '@wolf-tui/core'
import { clampScrollOffset, type ClassNameValue } from '@wolf-tui/shared'
import { BoxComponent } from '../box/box.component'
import { injectInput } from '../../services/stdin.service'

//#region Types
/**
 * Public props accepted by `<w-scroll-view>`.
 *
 * Provided for callers typing their inputs; Angular template bindings use the
 * individual `@Input()` decorators on {@link ScrollViewComponent}.
 */
export interface IScrollViewProps {
	/**
	 * Viewport height in rows. Required — the component renders a fixed-height
	 * window and clips content that overflows it.
	 */
	height: number

	/**
	 * Controlled scroll offset in rows from the top of the content. When defined,
	 * the parent owns scroll state; the component never updates offset internally
	 * and instead emits via `onScroll` for every scroll action.
	 *
	 * When undefined (default), the component manages offset with internal state.
	 */
	offset?: number

	/**
	 * Enable built-in key bindings (arrows, PageUp/PageDown, Home/End).
	 *
	 * @default true
	 */
	keyBindings?: boolean

	/** CSS-like class name forwarded to the viewport box. */
	className?: ClassNameValue

	/**
	 * CSS-like inline styles forwarded to the viewport box. `height` and
	 * `overflow` are set by the component and cannot be overridden.
	 */
	style?: Partial<Styles>
}

/**
 * Imperative handle exposed on the component instance. Consumers can grab it
 * via `@ViewChild(ScrollViewComponent)` and call these methods directly.
 */
export interface IScrollViewHandle {
	/** Scroll to an absolute offset (clamped to content bounds). */
	scrollTo(offset: number): void
	/** Scroll by a relative delta in rows (clamped to content bounds). */
	scrollBy(delta: number): void
	/** Jump to the top (offset = 0). */
	scrollToTop(): void
	/** Jump to the bottom (offset = contentHeight - viewportHeight). */
	scrollToBottom(): void
	/** Current scroll offset in rows. */
	getScrollOffset(): number
	/** Measured content height in rows. */
	getContentHeight(): number
	/** Viewport height in rows (as passed via `height`). */
	getViewportHeight(): number
}
//#endregion Types

//#region ScrollViewComponent
/**
 * `<w-scroll-view>` is a fixed-height viewport that clips its children and
 * allows scrolling through overflowing content. It uses a negative `marginTop`
 * on an inner box plus `overflow: hidden` on the outer box to scroll — no
 * terminal scrollback is involved.
 *
 * Uncontrolled (internal offset):
 *
 * ```html
 * <w-scroll-view [height]="8">
 *   <w-text>Line 1</w-text>
 *   <w-text>Line 2</w-text>
 * </w-scroll-view>
 * ```
 *
 * Controlled:
 *
 * ```html
 * <w-scroll-view
 *   [height]="8"
 *   [offset]="offset()"
 *   (onScroll)="offset.set($event)"
 * >
 *   ...
 * </w-scroll-view>
 * ```
 *
 * Imperative via `@ViewChild`:
 *
 * ```ts
 * @ViewChild(ScrollViewComponent) scrollView!: ScrollViewComponent
 * this.scrollView.scrollToBottom()
 * ```
 */
@Component({
	selector: 'w-scroll-view',
	standalone: true,
	imports: [BoxComponent],
	template: `
		<w-box [style]="outerStyle()" [className]="className">
			<w-box #inner [style]="innerStyle()">
				<ng-content />
			</w-box>
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollViewComponent
	implements IScrollViewHandle, OnInit, OnChanges, AfterViewInit, OnDestroy
{
	//#region Inputs
	@Input({ required: true }) height!: number
	@Input() offset?: number
	@Input() keyBindings: boolean = true
	@Input() className?: ClassNameValue
	@Input() style?: Partial<Styles>
	//#endregion Inputs

	//#region Outputs
	/** Emits whenever the scroll offset changes (key binding or imperative). */
	@Output() onScroll = new EventEmitter<number>()
	/** Emits when the measured content height changes. */
	@Output() onContentHeightChange = new EventEmitter<number>()
	//#endregion Outputs

	//#region View Queries
	@ViewChild('inner', { read: ElementRef })
	private innerRef?: ElementRef<DOMElement>
	//#endregion View Queries

	//#region Internal State
	private _height = signal(0)
	private _controlledOffset = signal<number | undefined>(undefined)
	private _internalOffset = signal(0)
	private _contentHeight = signal(0)
	private _style = signal<Partial<Styles> | undefined>(undefined)
	private measureScheduled = false
	//#endregion Internal State

	//#region Computed
	/** Current effective offset (controlled if set, internal otherwise). */
	readonly effectiveOffset = computed(() => {
		const c = this._controlledOffset()
		return c !== undefined ? c : this._internalOffset()
	})

	readonly outerStyle = computed((): Partial<Styles> => {
		const base = this._style() ?? {}
		return {
			...base,
			height: this._height(),
			overflow: 'hidden',
			flexDirection: 'column',
		}
	})

	readonly innerStyle = computed((): Partial<Styles> => {
		return {
			flexDirection: 'column',
			flexShrink: 0,
			marginTop: -this.effectiveOffset(),
		}
	})
	//#endregion Computed

	//#region Lifecycle
	constructor() {
		injectInput(
			(_input, key) => {
				if (!this.keyBindings) return
				const offset = this.effectiveOffset()
				const h = this._height()
				if (key.upArrow) return this.applyOffset(offset - 1)
				if (key.downArrow) return this.applyOffset(offset + 1)
				if (key.pageUp) return this.applyOffset(offset - h)
				if (key.pageDown) return this.applyOffset(offset + h)
				if (key.home) return this.applyOffset(0)
				if (key.end) return this.applyOffset(Number.MAX_SAFE_INTEGER)
			},
			{ isActive: () => this.keyBindings }
		)
	}

	ngOnInit(): void {
		this.syncInputs()
	}

	ngOnChanges(): void {
		this.syncInputs()
	}

	ngAfterViewInit(): void {
		this.measureContent()
	}

	ngOnDestroy(): void {
		// no-op — injectInput registers its own DestroyRef cleanup
	}
	//#endregion Lifecycle

	//#region Imperative API
	scrollTo(offset: number): void {
		this.applyOffset(offset)
	}

	scrollBy(delta: number): void {
		this.applyOffset(this.effectiveOffset() + delta)
	}

	scrollToTop(): void {
		this.applyOffset(0)
	}

	scrollToBottom(): void {
		this.applyOffset(Number.MAX_SAFE_INTEGER)
	}

	getScrollOffset(): number {
		return this.effectiveOffset()
	}

	getContentHeight(): number {
		return this._contentHeight()
	}

	getViewportHeight(): number {
		return this._height()
	}
	//#endregion Imperative API

	//#region Private Methods
	private syncInputs(): void {
		this._height.set(this.height)
		this._controlledOffset.set(this.offset)
		this._style.set(this.style)
		// After a height or offset input change, remeasure on next tick so the
		// inner box's laid-out height reflects the new viewport constraints.
		this.scheduleMeasure()
	}

	private applyOffset(next: number): void {
		const clamped = clampScrollOffset(next, {
			contentHeight: this._contentHeight(),
			viewportHeight: this._height(),
		})
		const isControlled = this._controlledOffset() !== undefined
		// WHY: capture previous offset BEFORE mutating the signal. Angular signals
		// update synchronously, so reading `effectiveOffset()` after `.set(clamped)`
		// always returns `clamped` — the emit-diff check would never fire for
		// uncontrolled mode. Mirrors React's behavior where `offset` is the
		// closed-over previous value.
		const previousOffset = this.effectiveOffset()
		if (!isControlled) {
			if (this._internalOffset() !== clamped) {
				this._internalOffset.set(clamped)
			}
		}
		if (clamped !== previousOffset || isControlled) {
			this.onScroll.emit(clamped)
		}
		// After offset change, content height can't change, but a remeasure is
		// cheap and defensive in case external children mutated in the same tick.
		this.scheduleMeasure()
	}

	private scheduleMeasure(): void {
		if (this.measureScheduled) return
		this.measureScheduled = true
		queueMicrotask(() => {
			this.measureScheduled = false
			this.measureContent()
		})
	}

	private measureContent(): void {
		const el = this.innerRef?.nativeElement
		if (!el) return
		const dims = measureElement(el)
		if (dims.height !== this._contentHeight()) {
			this._contentHeight.set(dims.height)
			this.onContentHeightChange.emit(dims.height)
			// Re-clamp offset against new content bounds.
			const current = this.effectiveOffset()
			const clamped = clampScrollOffset(current, {
				contentHeight: dims.height,
				viewportHeight: this._height(),
			})
			if (clamped !== current) {
				const isControlled = this._controlledOffset() !== undefined
				if (!isControlled) {
					this._internalOffset.set(clamped)
				}
				this.onScroll.emit(clamped)
			}
		}
	}
	//#endregion Private Methods
}
//#endregion ScrollViewComponent
