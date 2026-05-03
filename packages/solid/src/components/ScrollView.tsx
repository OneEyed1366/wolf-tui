import {
	type JSX,
	createSignal,
	createMemo,
	createEffect,
	splitProps,
	on,
} from 'solid-js'
import type { Styles } from '@wolf-tui/core'
import { measureElement } from '@wolf-tui/core'
import {
	clampScrollOffset,
	getBottomOffset,
	type IScrollMetrics,
} from '@wolf-tui/shared'
import { useInput } from '../composables/use-input'
import { resolveClassName, type ClassNameValue } from '../styles'

//#region Types
export interface IScrollViewHandle {
	scrollTo: (offset: number) => void
	scrollBy: (delta: number) => void
	scrollToTop: () => void
	scrollToBottom: () => void
	getScrollOffset: () => number
	getContentHeight: () => number
	getViewportHeight: () => number
}

export interface IScrollViewProps {
	/**
	 * Viewport height in terminal rows.
	 *
	 * Content above this height is clipped by the outer box.
	 */
	height: number

	/**
	 * Controlled scroll offset (in rows). If provided, the component becomes
	 * controlled — onScroll must be used to update the parent's state in
	 * response to keyboard input.
	 */
	offset?: number

	/**
	 * Whether to install default keyboard bindings (arrows, PageUp/Down,
	 * Home/End).
	 *
	 * @default true
	 */
	keyBindings?: boolean

	/**
	 * Fires whenever the internal or controlled offset would change.
	 *
	 * In controlled mode, parent must persist the new offset via `offset` prop.
	 */
	onScroll?: (offset: number) => void

	/**
	 * Fires when the measured inner content height changes.
	 */
	onContentHeightChange?: (height: number) => void

	/**
	 * Extra style applied to the outer (clipping) box.
	 */
	style?: Styles

	/**
	 * className applied to the outer (clipping) box.
	 */
	className?: ClassNameValue

	/**
	 * Ref callback receiving an imperative handle for programmatic scrolling.
	 */
	ref?: (handle: IScrollViewHandle) => void

	children?: JSX.Element
}
//#endregion Types

//#region Component
export function ScrollView(props: IScrollViewProps): JSX.Element {
	const [local] = splitProps(props, [
		'height',
		'offset',
		'keyBindings',
		'onScroll',
		'onContentHeightChange',
		'style',
		'className',
		'ref',
		'children',
	])

	// WHY: internal offset is the source of truth in uncontrolled mode;
	// in controlled mode (local.offset !== undefined) we read from props
	// directly via resolvedOffset() below.
	const [internalOffset, setInternalOffset] = createSignal(0)
	const [contentHeight, setContentHeight] = createSignal(0)

	const isControlled = () => local.offset !== undefined

	const resolvedOffset = createMemo(() =>
		isControlled() ? (local.offset ?? 0) : internalOffset()
	)

	const viewportHeight = () => local.height

	const metrics = (): IScrollMetrics => ({
		contentHeight: contentHeight(),
		viewportHeight: viewportHeight(),
	})

	// WHY: single funnel so uncontrolled mutation and keyboard input clamp
	// against the same metrics; controlled mode only notifies the parent.
	const commitOffset = (next: number) => {
		const clamped = clampScrollOffset(next, metrics())
		if (!isControlled()) {
			setInternalOffset(clamped)
		}
		local.onScroll?.(clamped)
	}

	// WHY: store the inner DOM element so we can measure it after layout.
	// The ref callback fires synchronously during node attachment — BEFORE
	// calculateLayout runs — so measureElement would return 0. We keep the
	// element and re-measure on each scheduled render pass via a microtask
	// that runs after the layout phase has populated Taffy's computed layout.
	const [innerEl, setInnerEl] = createSignal<
		Parameters<typeof measureElement>[0] | null
	>(null)

	const innerRefCallback = (el: unknown) => {
		if (!el || typeof el !== 'object') return
		setInnerEl(el as Parameters<typeof measureElement>[0])
	}

	// WHY: defer measurement until after the render scheduler's flush
	// (calculateLayout + coreRenderer). `queueMicrotask` inside the effect
	// schedules the read on the next microtask tick — by then Taffy has
	// populated the inner box's computed layout. Mirrors React's measure-
	// in-render pattern, where re-measurement loops via state → re-render.
	createEffect(() => {
		const el = innerEl()
		if (!el) return
		// Re-run measurement on every offset change — cheap, and guarantees
		// that children-driven height changes propagate.
		resolvedOffset()
		queueMicrotask(() => {
			const dims = measureElement(el)
			if (dims.height !== contentHeight()) {
				setContentHeight(dims.height)
			}
		})
	})

	// WHY: notify parent on content-height changes. `on(..., { defer: true })`
	// skips the initial 0-height render so we don't fire a spurious callback.
	createEffect(
		on(
			contentHeight,
			(h) => {
				local.onContentHeightChange?.(h)
			},
			{ defer: true }
		)
	)

	// WHY: if content shrinks below current offset, re-clamp (uncontrolled only).
	createEffect(() => {
		const h = contentHeight()
		if (!isControlled()) {
			const current = internalOffset()
			const clamped = clampScrollOffset(current, {
				contentHeight: h,
				viewportHeight: viewportHeight(),
			})
			if (clamped !== current) {
				setInternalOffset(clamped)
				local.onScroll?.(clamped)
			}
		}
	})

	//#region Imperative Handle
	const handle: IScrollViewHandle = {
		scrollTo: (offset) => commitOffset(offset),
		scrollBy: (delta) => commitOffset(resolvedOffset() + delta),
		scrollToTop: () => commitOffset(0),
		scrollToBottom: () => commitOffset(getBottomOffset(metrics())),
		getScrollOffset: () => resolvedOffset(),
		getContentHeight: () => contentHeight(),
		getViewportHeight: () => viewportHeight(),
	}

	// WHY: invoke the ref callback once; Solid's ref prop handling unwraps
	// the function form for us on intrinsic elements, but for an imperative
	// handle we call it explicitly.
	if (local.ref) {
		local.ref(handle)
	}
	//#endregion Imperative Handle

	//#region Keyboard Bindings
	useInput(
		(_input, key) => {
			if (key.upArrow) {
				commitOffset(resolvedOffset() - 1)
				return
			}
			if (key.downArrow) {
				commitOffset(resolvedOffset() + 1)
				return
			}
			if (key.pageUp) {
				commitOffset(resolvedOffset() - viewportHeight())
				return
			}
			if (key.pageDown) {
				commitOffset(resolvedOffset() + viewportHeight())
				return
			}
			if (key.home) {
				commitOffset(0)
				return
			}
			if (key.end) {
				commitOffset(getBottomOffset(metrics()))
			}
		},
		{ isActive: () => (local.keyBindings ?? true) === true }
	)
	//#endregion Keyboard Bindings

	//#region Styles
	const outerStyle = (): Styles => {
		const userStyle = local.style ?? {}
		const resolved = resolveClassName(local.className)
		return {
			flexDirection: 'column',
			flexShrink: 0,
			...resolved,
			...userStyle,
			height: viewportHeight(),
			overflow: 'hidden',
		}
	}

	const innerStyle = (): Styles => ({
		flexDirection: 'column',
		flexShrink: 0,
		marginTop: -resolvedOffset(),
	})
	//#endregion Styles

	return (
		<wolfie-box style={outerStyle()}>
			<wolfie-box ref={innerRefCallback} style={innerStyle()}>
				{local.children}
			</wolfie-box>
		</wolfie-box>
	)
}
//#endregion Component

export type { IScrollViewProps as Props, IScrollViewProps as IProps }
