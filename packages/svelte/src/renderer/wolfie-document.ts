import type { WolfieNodeBase } from './wolfie-element.js'
import {
	WolfieElement,
	WolfieText,
	WolfieComment,
	WolfieDocumentFragment,
	setNodeOpsConfig,
} from './wolfie-element.js'
import { type LayoutTree } from '@wolfie/core'

//#region Types

interface SavedGlobals {
	document: typeof globalThis.document | undefined
	Node: typeof globalThis.Node | undefined
	Element: typeof globalThis.Element | undefined
	HTMLElement: typeof globalThis.HTMLElement | undefined
	SVGElement: typeof globalThis.SVGElement | undefined
	Text: typeof globalThis.Text | undefined
	Comment: typeof globalThis.Comment | undefined
	window: typeof globalThis.window | undefined
	navigator: typeof globalThis.navigator | undefined
	requestAnimationFrame: typeof globalThis.requestAnimationFrame | undefined
	cancelAnimationFrame: typeof globalThis.cancelAnimationFrame | undefined
	customElements: typeof globalThis.customElements | undefined
}

interface PatchConfig {
	getLayoutTree: () => LayoutTree
	getScheduleRender: () => (() => void) | null
}

//#endregion Types

//#region Saved state

let saved: SavedGlobals | null = null

//#endregion Saved state

//#region patchGlobals

/**
 * Patch globalThis.document and related globals so Svelte 5's compiled
 * `document.createElement()` calls produce WolfieElement wrappers that
 * delegate to wolfie's core DOM API.
 *
 * Must be called BEFORE Svelte's `mount()`. Call `restoreGlobals()` on cleanup.
 */
export function patchGlobals(patchConfig: PatchConfig): void {
	if (saved) return // Already patched

	// Wire up the element factory config
	setNodeOpsConfig(patchConfig)

	// Save originals
	saved = {
		document: globalThis.document,
		Node: globalThis.Node,
		Element: globalThis.Element,
		HTMLElement: globalThis.HTMLElement,
		SVGElement: globalThis.SVGElement,
		Text: globalThis.Text,
		Comment: globalThis.Comment,
		window: globalThis.window,
		navigator: globalThis.navigator,
		requestAnimationFrame: globalThis.requestAnimationFrame,
		cancelAnimationFrame: globalThis.cancelAnimationFrame,
		customElements: globalThis.customElements,
	}

	//#region Node class

	// Svelte's init_operations() steals firstChild/nextSibling via
	// Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild').
	// We MUST define these as property descriptors with get functions.
	class WNode {
		static readonly ELEMENT_NODE = 1
		static readonly TEXT_NODE = 3
		static readonly COMMENT_NODE = 8
		static readonly DOCUMENT_FRAGMENT_NODE = 11
	}

	Object.defineProperties(WNode.prototype, {
		firstChild: {
			get(this: WolfieNodeBase) {
				return this.firstChild
			},
			configurable: true,
		},
		nextSibling: {
			get(this: WolfieNodeBase) {
				return this.nextSibling
			},
			configurable: true,
		},
		previousSibling: {
			get(this: WolfieNodeBase) {
				return this.previousSibling
			},
			configurable: true,
		},
		lastChild: {
			get(this: WolfieNodeBase) {
				return this.lastChild
			},
			configurable: true,
		},
		parentNode: {
			get(this: WolfieNodeBase) {
				return this.parentNode
			},
			configurable: true,
		},
		childNodes: {
			get(this: WolfieNodeBase) {
				return this.childNodes
			},
			configurable: true,
		},
		textContent: {
			get(this: WolfieNodeBase) {
				return this.textContent
			},
			set(this: WolfieNodeBase, value: string) {
				this.textContent = value
			},
			configurable: true,
		},
		nodeType: {
			get(this: WolfieNodeBase) {
				return this.nodeType
			},
			configurable: true,
		},
	})

	//#endregion Node class

	//#region Element/HTMLElement/SVGElement/Text/Comment classes

	class WElement extends WNode {
		// V8 shape hints that Svelte writes on Element.prototype
		declare __click: unknown
		declare __className: unknown
		declare __attributes: unknown
		declare __style: unknown
		declare __e: unknown
	}

	class WHTMLElement extends WElement {}
	class WSVGElement extends WElement {}

	class WText extends WNode {
		// Svelte writes __t on Text.prototype
		declare __t: unknown
	}

	class WComment extends WNode {}

	//#endregion Element/HTMLElement/SVGElement/Text/Comment classes

	//#region Document object

	const noop = () => {}

	const wolfieDocument = {
		createElement(tag: string): WolfieElement | WolfieDocumentFragment {
			// Template compat — Svelte may use <template> for cloneNode patterns
			if (tag === 'template') {
				const frag = new WolfieDocumentFragment()
				// Template needs innerHTML setter + content getter
				Object.defineProperty(frag, 'innerHTML', {
					set(_html: string) {
						// Template innerHTML in Svelte tree mode is unused — stub
					},
					get() {
						return ''
					},
				})
				Object.defineProperty(frag, 'content', {
					get() {
						return frag
					},
				})
				return frag
			}

			// Normalize tag: prefix with 'wolfie-' if not already
			const normalized = tag.startsWith('wolfie-') ? tag : `wolfie-${tag}`
			return new WolfieElement(normalized)
		},

		createElementNS(_ns: string | null, tag: string): WolfieElement {
			const normalized = tag.startsWith('wolfie-') ? tag : `wolfie-${tag}`
			return new WolfieElement(normalized)
		},

		createTextNode(text: string): WolfieText {
			return new WolfieText(text)
		},

		createComment(data: string): WolfieComment {
			return new WolfieComment(data)
		},

		createDocumentFragment(): WolfieDocumentFragment {
			return new WolfieDocumentFragment()
		},

		importNode(node: WolfieNodeBase, deep?: boolean): WolfieNodeBase {
			return node.cloneNode(deep ?? false)
		},

		addEventListener: noop,
		removeEventListener: noop,

		querySelector(_selector: string): null {
			return null
		},

		querySelectorAll(_selector: string): never[] {
			return []
		},

		get head(): WolfieElement {
			return new WolfieElement('wolfie-box')
		},

		get body(): WolfieElement {
			return new WolfieElement('wolfie-box')
		},

		get documentElement(): WolfieElement {
			return new WolfieElement('wolfie-box')
		},

		createEvent(type: string): Event {
			return { type, bubbles: false, cancelable: false } as unknown as Event
		},
	}

	//#endregion Document object

	//#region Window object

	const wolfieWindow = {
		document: wolfieDocument,
		getComputedStyle() {
			return {}
		},
		addEventListener: noop,
		removeEventListener: noop,
	}

	//#endregion Window object

	//#region Apply patches

	// Using Object.defineProperty to handle readonly/non-configurable globals
	const g = globalThis as Record<string, unknown>
	g['document'] = wolfieDocument
	g['Node'] = WNode
	g['Element'] = WElement
	g['HTMLElement'] = WHTMLElement
	g['SVGElement'] = WSVGElement
	g['Text'] = WText
	g['Comment'] = WComment
	g['window'] = wolfieWindow
	g['navigator'] = { userAgent: 'wolfie' }
	g['requestAnimationFrame'] = (cb: () => void) => setTimeout(cb, 16)
	g['cancelAnimationFrame'] = (id: ReturnType<typeof setTimeout>) =>
		clearTimeout(id)
	g['customElements'] = { define: noop, get: () => undefined }

	//#endregion Apply patches
}

//#endregion patchGlobals

//#region restoreGlobals

/**
 * Restore all globals that were patched by `patchGlobals()`.
 * Safe to call multiple times — only restores if currently patched.
 */
export function restoreGlobals(): void {
	if (!saved) return

	const g = globalThis as Record<string, unknown>
	g['document'] = saved.document
	g['Node'] = saved.Node
	g['Element'] = saved.Element
	g['HTMLElement'] = saved.HTMLElement
	g['SVGElement'] = saved.SVGElement
	g['Text'] = saved.Text
	g['Comment'] = saved.Comment
	g['window'] = saved.window
	g['navigator'] = saved.navigator
	g['requestAnimationFrame'] = saved.requestAnimationFrame
	g['cancelAnimationFrame'] = saved.cancelAnimationFrame
	g['customElements'] = saved.customElements

	saved = null
}

//#endregion restoreGlobals
