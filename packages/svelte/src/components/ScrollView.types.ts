import type { Snippet } from 'svelte'
import type { Styles } from '@wolf-tui/core'
import type { ClassNameValue } from '../styles/index.js'

//#region Types
export type IScrollViewProps = {
	height: number
	offset?: number
	keyBindings?: boolean
	onScroll?: (offset: number) => void
	onContentHeightChange?: (height: number) => void
	style?: Styles
	class?: ClassNameValue
	className?: ClassNameValue
	children?: Snippet
}

export type IScrollViewHandle = {
	scrollTo: (offset: number) => void
	scrollBy: (delta: number) => void
	scrollToTop: () => void
	scrollToBottom: () => void
	getScrollOffset: () => number
	getContentHeight: () => number
	getViewportHeight: () => number
}
//#endregion Types
