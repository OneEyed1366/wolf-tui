import type { ReactNode } from 'react'
import type { Styles } from '@wolf-tui/core'
import type { ClassNameValue } from '../../styles/index'

export type IScrollViewProps = {
	/**
	Viewport height in rows. Required — the component renders a fixed-height
	window and clips content that overflows it.
	*/
	height: number

	/**
	Controlled scroll offset in rows from the top of the content. When defined,
	the parent owns scroll state; the component never updates offset internally
	and instead calls `onScroll` for every scroll action.

	When undefined (default), the component manages offset with internal state.
	*/
	offset?: number

	/**
	Enable built-in key bindings (arrows, PageUp/PageDown, Home/End).

	@default true
	*/
	keyBindings?: boolean

	/**
	Called whenever the scroll offset changes, either from a key binding or an
	imperative method call. For controlled usage, the parent should update its
	`offset` prop in response.
	*/
	onScroll?: (offset: number) => void

	/**
	Called when the measured content height changes. Useful for rendering a
	scrollbar or "x of y" status line outside the viewport.
	*/
	onContentHeightChange?: (height: number) => void

	/**
	CSS-like class name forwarded to the viewport box.
	*/
	className?: ClassNameValue

	/**
	CSS-like inline styles forwarded to the viewport box. `height` and
	`overflow` are set by the component and cannot be overridden.
	*/
	style?: Styles

	children?: ReactNode
}

export type IScrollViewHandle = {
	/** Scroll to an absolute offset (clamped to content bounds). */
	scrollTo: (offset: number) => void
	/** Scroll by a relative delta in rows (clamped to content bounds). */
	scrollBy: (delta: number) => void
	/** Jump to the top (offset = 0). */
	scrollToTop: () => void
	/** Jump to the bottom (offset = contentHeight - viewportHeight). */
	scrollToBottom: () => void
	/** Current scroll offset in rows. */
	getScrollOffset: () => number
	/** Measured content height in rows. */
	getContentHeight: () => number
	/** Viewport height in rows (as passed via `height`). */
	getViewportHeight: () => number
}
