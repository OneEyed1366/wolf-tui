import {
	WolfieNodeBase,
	WolfieComment as WolfieCommentCls,
} from './wolfie-element'
import { WolfieDocument } from './wolfie-document'
import { setActiveWolfieDocument, type NodeOpsConfig } from './wolfie-element'

export type { NodeOpsConfig }
export {
	WolfieNodeBase,
	WolfieDocumentFragment,
	WolfieElement,
	WolfieText,
	WolfieComment,
} from './wolfie-element'
export { WolfieDocument }

export function installDocument(cfg: NodeOpsConfig): () => void {
	const doc = new WolfieDocument(cfg)
	setActiveWolfieDocument(doc)

	const prevDoc = (globalThis as any).document
	const prevWindow = (globalThis as any).window
	const prevNode = (globalThis as any).Node
	const prevElement = (globalThis as any).Element
	const prevText = (globalThis as any).Text
	const prevComment = (globalThis as any).Comment
	const prevNavigator = (globalThis as any).navigator
	const prevCustomElements = (globalThis as any).customElements

	;(globalThis as any).document = doc

	// WHY: Svelte 5's runtime (svelte/internal/client) references window.* globals.
	// Node.js has no window. A minimal stub prevents ReferenceError crashes.
	if (!prevWindow) {
		;(globalThis as any).window = {
			addEventListener: () => {},
			removeEventListener: () => {},
			document: doc,
		}
	}

	// WHY: init_operations() in Svelte's runtime steals Node.prototype.firstChild
	// and Node.prototype.nextSibling getters via Object.getOwnPropertyDescriptor.
	// It then calls them as first_child_getter.call(anyNode). Setting
	// globalThis.Node.prototype = WolfieNodeBase.prototype ensures these getters
	// are our implementations that read _wchildren / _wparent.
	;(globalThis as any).Node = { prototype: WolfieNodeBase.prototype }

	// WHY: init_operations() reads Element.prototype and Text.prototype to assign
	// V8 shape-optimization fields (__click, __className, __t, etc.).
	// Plain object prototypes are fine — these assignments are no-ops for us.
	;(globalThis as any).Element = { prototype: {} }
	;(globalThis as any).Text = { prototype: {} }

	// WHY: first_child() in operations.js does `first instanceof Comment` to detect
	// Svelte's empty anchor comment nodes (<!---->). Without globalThis.Comment set
	// to our WolfieComment class the instanceof check throws ReferenceError.
	;(globalThis as any).Comment = WolfieCommentCls

	// WHY: set_custom_element_data() in attributes.js references customElements
	// to check whether a tag is a registered custom element. Node.js has no
	// customElements registry. A stub with get() returning undefined makes Svelte
	// fall through to the set_attribute() path (correct for wolfie-* elements).
	if (!prevCustomElements) {
		;(globalThis as any).customElements = {
			get: () => undefined,
			define: () => {},
		}
	}

	// WHY: init_operations() checks navigator.userAgent for Firefox detection.
	// Empty string → is_firefox = false → cloneNode used instead of importNode.
	if (!prevNavigator) {
		;(globalThis as any).navigator = { userAgent: '' }
	}

	return () => {
		;(globalThis as any).document = prevDoc
		if (!prevWindow) delete (globalThis as any).window
		if (!prevNavigator) delete (globalThis as any).navigator
		if (!prevCustomElements) delete (globalThis as any).customElements
		;(globalThis as any).Node = prevNode
		;(globalThis as any).Element = prevElement
		;(globalThis as any).Text = prevText
		;(globalThis as any).Comment = prevComment
		setActiveWolfieDocument(null)
	}
}
