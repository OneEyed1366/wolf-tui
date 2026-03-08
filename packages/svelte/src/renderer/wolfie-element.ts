import {
	appendChildNode,
	insertBeforeNode,
	removeChildNode,
	setAttribute,
	applyLayoutStyle,
	setStyle,
	isElement,
	logger,
	createNode,
	createTextNode,
	setTextNodeValue,
	type DOMElement,
	type DOMNode,
	type LayoutTree,
	type TextNode,
	type OutputTransformer,
	type Styles,
} from '@wolfie/core'
import { createStyleProxy } from './wolfie-style-proxy'

//#region Types
export interface NodeOpsConfig {
	getLayoutTree: () => LayoutTree
	getScheduleRender: () => (() => void) | undefined
}
//#endregion Types

//#region WolfieNodeBase
// WHY: All wolfie wrapper nodes extend this class so that Svelte's stolen
// Node.prototype.firstChild / nextSibling getters work correctly.
// init_operations() grabs these getters via Object.getOwnPropertyDescriptor
// then calls them as first_child_getter.call(anyWolfieNode).
// The _wchildren / _wparent arrays track the wrapper-level tree SEPARATELY
// from the raw DOMElement/TextNode hierarchy, because Svelte traverses the
// wrapper tree both before and after live-DOM insertion.
export class WolfieNodeBase {
	// WHY: nodeName declared here so logger.log(child.nodeName) works without casting
	readonly nodeName: string = ''
	_wchildren: WolfieNodeBase[] = []
	_wparent: WolfieNodeBase | null = null

	get firstChild(): WolfieNodeBase | null {
		return this._wchildren[0] ?? null
	}

	get lastChild(): WolfieNodeBase | null {
		return this._wchildren[this._wchildren.length - 1] ?? null
	}

	get nextSibling(): WolfieNodeBase | null {
		if (!this._wparent) return null
		const idx = this._wparent._wchildren.indexOf(this)
		return this._wparent._wchildren[idx + 1] ?? null
	}

	get previousSibling(): WolfieNodeBase | null {
		if (!this._wparent) return null
		const idx = this._wparent._wchildren.indexOf(this)
		return this._wparent._wchildren[idx - 1] ?? null
	}

	_wAddChild(child: WolfieNodeBase): void {
		if (child._wparent) child._wparent._wRemoveChild(child)
		child._wparent = this
		this._wchildren.push(child)
	}

	_wInsertBefore(child: WolfieNodeBase, ref: WolfieNodeBase): void {
		if (child._wparent) child._wparent._wRemoveChild(child)
		child._wparent = this
		const idx = this._wchildren.indexOf(ref)
		if (idx >= 0) this._wchildren.splice(idx, 0, child)
		else this._wchildren.push(child)
	}

	_wRemoveChild(child: WolfieNodeBase): void {
		const idx = this._wchildren.indexOf(child)
		if (idx >= 0) this._wchildren.splice(idx, 1)
		child._wparent = null
	}

	// Subclasses override; base returns self-clone (for DocumentFragment)
	cloneNode(_deep = true): WolfieNodeBase {
		return new WolfieNodeBase()
	}

	append(...nodes: Array<WolfieNodeBase | string>): void {
		for (const n of nodes) {
			if (typeof n !== 'string') this._wAddChild(n)
		}
	}
}
//#endregion WolfieNodeBase

//#region WolfieDocumentFragment
// WHY: Returned by document.createDocumentFragment() and template.content.
// Acts as a container during template instantiation — holds nodes before
// they're inserted into the live wolfie DOM.
export class WolfieDocumentFragment extends WolfieNodeBase {
	readonly nodeType = 11
	readonly nodeName = '#document-fragment'

	cloneNode(deep = true): WolfieDocumentFragment {
		const clone = new WolfieDocumentFragment()
		if (deep) {
			for (const child of this._wchildren) {
				clone._wAddChild(child.cloneNode(true))
			}
		}
		return clone
	}
}
//#endregion WolfieDocumentFragment

//#region Helpers
export type WolfieNode = _WolfieElement | WolfieText | WolfieComment

// WHY: Core DOM functions expect raw DOMNode, not wrapper objects.
export function unwrap(node: WolfieNodeBase): DOMNode {
	if (node instanceof _WolfieElement) return node.el
	if (node instanceof WolfieText) return node.textNode
	if (node instanceof WolfieComment) return node.dummyNode
	throw new Error(`unwrap: unknown node type ${node.constructor?.name}`)
}

// WHY: Used by before() / after() implementations on all node types.
// Inserts a wrapper node into a raw DOMElement parent before a ref DOMNode.
// Handles WolfieDocumentFragment by flattening its children.
function insertBeforeInRawParent(
	node: WolfieNodeBase,
	rawParent: DOMElement,
	rawRef: DOMNode,
	lt: LayoutTree
): void {
	if (node instanceof WolfieDocumentFragment) {
		for (const child of [...node._wchildren]) {
			insertBeforeInRawParent(child, rawParent, rawRef, lt)
		}
	} else if (node instanceof _WolfieElement) {
		initLayoutTreeRecursively(node.el, lt)
		insertBeforeNode(rawParent, node.el, rawRef, lt)
	} else if (node instanceof WolfieText) {
		insertBeforeNode(rawParent, node.textNode, rawRef, lt)
	} else if (node instanceof WolfieComment) {
		insertBeforeNode(rawParent, node.dummyNode, rawRef, lt)
	}
}

// WHY: Shared before() logic for all node types.
// Updates both the live wolfie DOM (via insertBeforeInRawParent) AND the
// wrapper tree (via _wparent._wInsertBefore / _wAddFragmentChildren).
function handleBeforeInsertion(
	self: WolfieNodeBase,
	nodes: Array<WolfieNodeBase | string>,
	rawParent: DOMElement | undefined,
	getRawRef: () => DOMNode,
	cfg: NodeOpsConfig
): void {
	for (const n of nodes) {
		if (typeof n === 'string') continue
		if (rawParent) {
			insertBeforeInRawParent(n, rawParent, getRawRef(), cfg.getLayoutTree())
		}
		if (self._wparent) {
			if (n instanceof WolfieDocumentFragment) {
				// WHY: Flatten fragment — browser DOM semantics: fragment loses children on insert
				const children = [...n._wchildren]
				n._wchildren = []
				for (const child of children) {
					self._wparent._wInsertBefore(child, self)
				}
			} else {
				self._wparent._wInsertBefore(n, self)
			}
		}
	}
	if (rawParent) cfg.getScheduleRender()?.()
}
//#endregion Helpers

//#region Layout Init
// WHY: When a subtree is assembled off-tree then inserted, new nodes lack
// Taffy layout IDs. This retroactively creates layout nodes and links
// parent→child relationships. Copied from packages/solid/src/renderer/node-ops.ts.
function initLayoutTreeRecursively(
	node: DOMElement,
	layoutTree: LayoutTree
): void {
	const wasUndefined = node.layoutNodeId === undefined
	if (wasUndefined && node.nodeName !== 'wolfie-virtual-text') {
		node.layoutNodeId = layoutTree.createNode({})
		node.layoutTree = layoutTree
		if (Object.keys(node.style).length > 0) {
			applyLayoutStyle(layoutTree, node.layoutNodeId, node.style)
		}
	}
	// WHY: wolfie-text is a leaf node — its size comes from squashTextNodes/setTextDimensions.
	// Svelte's {#if} blocks insert anchor comment dummyNodes INSIDE wolfie-text, which
	// initLayoutTreeRecursively would otherwise add as Taffy children, turning wolfie-text
	// into a flex container and causing Taffy to ignore setTextDimensions (→ width=0).
	if (node.nodeName === 'wolfie-text') return

	let layoutChildIndex = 0
	for (const child of node.childNodes) {
		if (isElement(child)) {
			const childEl = child as DOMElement
			initLayoutTreeRecursively(childEl, layoutTree)
			if (
				wasUndefined &&
				node.layoutNodeId !== undefined &&
				childEl.layoutNodeId !== undefined
			) {
				layoutTree.insertChild(
					node.layoutNodeId,
					childEl.layoutNodeId,
					layoutChildIndex++
				)
			}
		}
	}
}
//#endregion Layout Init

//#region Active Document Reference
// WHY: Nodes need ownerDocument ref without a circular import to wolfie-document.
let _activeDocument: unknown = null
export const setActiveWolfieDocument = (d: unknown): void => {
	_activeDocument = d
}
export const getActiveWolfieDocument = (): unknown => _activeDocument
//#endregion Active Document Reference

//#region _WolfieElement (base — without Proxy)
class _WolfieElement extends WolfieNodeBase {
	readonly nodeType = 1
	readonly nodeName: string
	readonly style: CSSStyleDeclaration

	constructor(
		public readonly el: DOMElement,
		protected cfg: NodeOpsConfig
	) {
		super()
		this.nodeName = el.nodeName
		this.style = createStyleProxy({
			el,
			getLayoutTree: cfg.getLayoutTree,
			scheduleRender: () => cfg.getScheduleRender()?.(),
		})
	}

	get parentNode(): WolfieNodeBase | null {
		return (this.el.parentNode as unknown as WolfieNodeBase) ?? null
	}
	get ownerDocument(): unknown {
		return _activeDocument
	}

	//#region Tree Operations
	appendChild(child: WolfieNodeBase): WolfieNodeBase {
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'svelte',
				op: 'appendChild',
				parent: this.el.nodeName,
				child: child.nodeName ?? '',
			})
		}
		const lt = this.cfg.getLayoutTree()
		if (child instanceof _WolfieElement) initLayoutTreeRecursively(child.el, lt)
		appendChildNode(this.el, unwrap(child), lt)
		this._wAddChild(child)
		this.cfg.getScheduleRender()?.()
		return child
	}

	removeChild(child: WolfieNodeBase): WolfieNodeBase {
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'svelte',
				op: 'removeChild',
				parent: this.el.nodeName,
				child: child.nodeName ?? '',
			})
		}
		removeChildNode(this.el, unwrap(child), this.cfg.getLayoutTree())
		this._wRemoveChild(child)
		this.cfg.getScheduleRender()?.()
		return child
	}

	insertBefore(
		child: WolfieNodeBase,
		anchor: WolfieNodeBase | null
	): WolfieNodeBase {
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'svelte',
				op: 'insertBefore',
				parent: this.el.nodeName,
				child: child.nodeName ?? '',
			})
		}
		const lt = this.cfg.getLayoutTree()
		if (child instanceof _WolfieElement) initLayoutTreeRecursively(child.el, lt)
		if (anchor) {
			insertBeforeNode(this.el, unwrap(child), unwrap(anchor), lt)
			this._wInsertBefore(child, anchor)
		} else {
			appendChildNode(this.el, unwrap(child), lt)
			this._wAddChild(child)
		}
		this.cfg.getScheduleRender()?.()
		return child
	}
	//#endregion Tree Operations

	//#region Svelte DOM Interface
	// WHY: Svelte calls node.before(dom) to insert content before this node.
	before(...nodes: Array<WolfieNodeBase | string>): void {
		handleBeforeInsertion(
			this,
			nodes,
			this.el.parentNode as DOMElement | undefined,
			() => this.el,
			this.cfg
		)
	}

	// WHY: Svelte calls node.remove() during effect cleanup (remove_effect_dom).
	remove(): void {
		const rawParent = this.el.parentNode as DOMElement | undefined
		if (rawParent) {
			removeChildNode(rawParent, this.el, this.cfg.getLayoutTree())
			this.cfg.getScheduleRender()?.()
		}
		if (this._wparent) this._wparent._wRemoveChild(this)
	}

	// WHY: clear_text_content() sets textContent = '' to clear a node's children.
	set textContent(v: string) {
		while (this.el.childNodes.length > 0) {
			removeChildNode(this.el, this.el.childNodes[0]!, this.cfg.getLayoutTree())
		}
		for (const child of this._wchildren) child._wparent = null
		this._wchildren = []
		if (v !== '') {
			const tw = new WolfieText(v, this.cfg)
			this.appendChild(tw)
		}
		this.cfg.getScheduleRender()?.()
	}

	// WHY: Svelte uses cloneNode(true) to clone cached template nodes.
	// Creates a new DOMElement WITHOUT a layout tree (assigned later by
	// initLayoutTreeRecursively when the clone is inserted into the live DOM).
	cloneNode(deep = true): _WolfieElement {
		const rawClone = createNode(this.el.nodeName as any)
		for (const [k, v] of Object.entries(this.el.attributes)) {
			setAttribute(rawClone, k, String(v))
		}
		Object.assign(rawClone.style, this.el.style)
		const wrapper = new WolfieElement(rawClone, this.cfg)
		if (deep) {
			for (const child of this._wchildren) {
				const childClone = child.cloneNode(true)
				wrapper._wAddChild(childClone)
				// WHY: Also build the raw DOMElement hierarchy so that
				// initLayoutTreeRecursively can walk rawClone.childNodes on insertion.
				appendChildNode(rawClone, unwrap(childClone as WolfieNode))
			}
		}
		return wrapper
	}
	//#endregion Svelte DOM Interface

	setAttribute(name: string, value: string): void {
		if (name === 'style') return
		if (name === 'class' || name === 'className') {
			setAttribute(this.el, 'class', value)
		} else {
			setAttribute(this.el, name, value)
		}
		this.cfg.getScheduleRender()?.()
	}

	// WHY: set_custom_element_data() in Svelte's attributes.js calls
	// node.getAttribute('is') to check if the element is a customized built-in,
	// and node.nodeName to look up registered setters. We store attributes in
	// el.attributes — read from there. Returns null for missing attributes
	// (matching DOM spec) so the fallback path in set_custom_element_data triggers.
	getAttribute(name: string): string | null {
		const val = this.el.attributes[name]
		return val == null ? null : String(val)
	}

	set className(v: string) {
		setAttribute(this.el, 'class', v)
		this.cfg.getScheduleRender()?.()
	}
	get className(): string {
		return String(this.el.attributes['class'] ?? '')
	}

	// WHY: wolfie uses stdin data events, not browser DOM events.
	addEventListener(): void {}
	removeEventListener(): void {}
}
//#endregion _WolfieElement

//#region WolfieElement (Proxy wrapper for arbitrary prop assignments)
// WHY: Svelte 5 sets non-string props via direct property assignment:
//   el.internal_transform = fn, el.internal_static = true
// A Proxy intercepts these before they fall through to generic object storage.
export class WolfieElement extends _WolfieElement {
	constructor(el: DOMElement, cfg: NodeOpsConfig) {
		super(el, cfg)
		return new Proxy(this, {
			set(target, prop, value) {
				if (prop === 'internal_transform') {
					target.el.internal_transform = value as OutputTransformer
					cfg.getScheduleRender()?.()
					return true
				}
				if (prop === 'internal_static') {
					target.el.internal_static = value
					return true
				}
				if (prop === 'internal_accessibility') {
					setAttribute(target.el, 'internal_accessibility', value as string)
					return true
				}
				// WHY: Svelte's set_style() stores the raw style object as dom.__style
				// (used for dirty-checking on re-renders) BEFORE converting to cssText.
				// We intercept __style to apply the object-form style directly to the
				// wolfie element — this populates el.style so initLayoutTreeRecursively
				// can call applyLayoutStyle when the element is inserted into the DOM.
				// If layoutNodeId is already set (re-renders), we apply immediately.
				if (prop === '__style' && value !== null && typeof value === 'object') {
					setStyle(target.el, value as Styles)
					const lt = cfg.getLayoutTree()
					if (target.el.layoutNodeId !== undefined) {
						applyLayoutStyle(lt, target.el.layoutNodeId, value as Styles)
						cfg.getScheduleRender()?.()
					}
					return true
				}
				;(target as Record<string, unknown>)[prop as string] = value
				return true
			},
		})
	}
}
//#endregion WolfieElement

//#region WolfieText
// WHY: Wraps a wolfie TextNode. Svelte creates text nodes for dynamic content
// ({expression}) and updates them via set_text() which sets nodeValue.
export class WolfieText extends WolfieNodeBase {
	readonly nodeType = 3
	readonly nodeName = '#text'
	readonly textNode: TextNode

	constructor(
		value: string,
		private cfg: NodeOpsConfig
	) {
		super()
		this.textNode = createTextNode(String(value ?? ''))
	}

	get data(): string {
		return this.textNode.nodeValue
	}
	set data(value: string) {
		setTextNodeValue(
			this.textNode,
			String(value ?? ''),
			this.cfg.getLayoutTree()
		)
		this.cfg.getScheduleRender()?.()
	}

	get nodeValue(): string {
		return this.data
	}
	set nodeValue(v: string) {
		this.data = v
	}

	get parentNode() {
		return this.textNode.parentNode ?? null
	}
	get ownerDocument(): unknown {
		return _activeDocument
	}

	before(...nodes: Array<WolfieNodeBase | string>): void {
		handleBeforeInsertion(
			this,
			nodes,
			this.textNode.parentNode as DOMElement | undefined,
			() => this.textNode,
			this.cfg
		)
	}

	remove(): void {
		const rawParent = this.textNode.parentNode as DOMElement | undefined
		if (rawParent) {
			removeChildNode(rawParent, this.textNode, this.cfg.getLayoutTree())
			this.cfg.getScheduleRender()?.()
		}
		if (this._wparent) this._wparent._wRemoveChild(this)
	}

	cloneNode(_deep = true): WolfieText {
		return new WolfieText(this.data, this.cfg)
	}
}
//#endregion WolfieText

//#region WolfieComment
// WHY: Svelte uses comment nodes as anchors/markers for dynamic blocks.
// nodeType=8 (COMMENT_NODE). wolfie's renderer skips them — pure structure.
export class WolfieComment extends WolfieNodeBase {
	readonly nodeType = 8
	readonly nodeName = '#comment'
	readonly dummyNode: DOMElement

	constructor(
		public data = '',
		private cfg: NodeOpsConfig
	) {
		super()
		// WHY: Core DOM functions require DOMNode arguments. WolfieComment has
		// no wolfie visual equivalent, so we use a minimal placeholder element
		// with no layout node. Taffy ignores elements without layoutNodeId.
		this.dummyNode = createNode('wolfie-comment' as any)
	}

	get parentNode() {
		return this.dummyNode.parentNode ?? null
	}
	get ownerDocument(): unknown {
		return _activeDocument
	}

	before(...nodes: Array<WolfieNodeBase | string>): void {
		handleBeforeInsertion(
			this,
			nodes,
			this.dummyNode.parentNode as DOMElement | undefined,
			() => this.dummyNode,
			this.cfg
		)
	}

	remove(): void {
		const rawParent = this.dummyNode.parentNode as DOMElement | undefined
		if (rawParent) {
			removeChildNode(rawParent, this.dummyNode, this.cfg.getLayoutTree())
			this.cfg.getScheduleRender()?.()
		}
		if (this._wparent) this._wparent._wRemoveChild(this)
	}

	cloneNode(_deep = true): WolfieComment {
		return new WolfieComment(this.data, this.cfg)
	}
}
//#endregion WolfieComment
