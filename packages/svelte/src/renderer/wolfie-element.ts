import {
	createNode,
	createTextNode,
	appendChildNode,
	insertBeforeNode,
	removeChildNode,
	setAttribute,
	setStyle,
	setTextNodeValue,
	applyLayoutStyle,
	logger,
	type DOMElement,
	type TextNode,
	type ElementNames,
	type LayoutTree,
} from '@wolfie/core'
import type { Styles } from '@wolfie/core'

//#region Type guards

const VALID_ELEMENT_NAMES = new Set<string>([
	'wolfie-root',
	'wolfie-box',
	'wolfie-text',
	'wolfie-virtual-text',
])

function isElementName(tag: string): tag is ElementNames {
	return VALID_ELEMENT_NAMES.has(tag)
}

function isNodeConnected(node: WolfieNodeBase): boolean {
	let current: WolfieNodeBase | null = node
	while (current) {
		if (current.nodeName === 'wolfie-root') return true
		current = current._wparent
	}
	return false
}

//#endregion Type guards

//#region Style proxy type

/** Proxy target shape for the style property — satisfies Svelte's style access patterns */
interface StyleProxy {
	cssText: string
	[key: string]: string
}

//#endregion Style proxy type

//#region Config

interface NodeOpsConfig {
	getLayoutTree: () => LayoutTree
	getScheduleRender: () => (() => void) | null
}

let config: NodeOpsConfig | undefined

export function setNodeOpsConfig(cfg: NodeOpsConfig): void {
	config = cfg
}

function getLayoutTree(): LayoutTree {
	if (!config)
		throw new Error(
			'NodeOpsConfig not set — call setNodeOpsConfig() before mount()'
		)
	return config.getLayoutTree()
}

function scheduleRender(): void {
	const fn = config?.getScheduleRender()
	if (fn) fn()
}

//#endregion Config

//#region WolfieNodeBase

/**
 * Abstract base class for all wolfie DOM wrapper nodes.
 * Provides the standard DOM navigation and mutation API that Svelte 5 expects.
 *
 * Svelte's compiled output calls appendChild, insertBefore, removeChild, firstChild,
 * nextSibling, etc. — all routed through this base class.
 */
export abstract class WolfieNodeBase {
	_wchildren: WolfieNodeBase[] = []
	_wparent: WolfieNodeBase | null = null

	abstract readonly nodeType: number
	abstract readonly nodeName: string

	// Svelte V8 shape hints — set on prototype so V8 sees them early
	declare __click: unknown
	declare __className: unknown
	declare __attributes: unknown
	declare __style: unknown
	declare __e: unknown

	//#region Navigation

	get firstChild(): WolfieNodeBase | null {
		return this._wchildren[0] ?? null
	}

	get lastChild(): WolfieNodeBase | null {
		return this._wchildren[this._wchildren.length - 1] ?? null
	}

	get nextSibling(): WolfieNodeBase | null {
		if (!this._wparent) return null
		const siblings = this._wparent._wchildren
		const idx = siblings.indexOf(this)
		return siblings[idx + 1] ?? null
	}

	get previousSibling(): WolfieNodeBase | null {
		if (!this._wparent) return null
		const siblings = this._wparent._wchildren
		const idx = siblings.indexOf(this)
		return idx > 0 ? (siblings[idx - 1] ?? null) : null
	}

	get parentNode(): WolfieNodeBase | null {
		return this._wparent
	}

	get parentElement(): WolfieNodeBase | null {
		return this._wparent
	}

	get childNodes(): WolfieNodeBase[] {
		return this._wchildren
	}

	get isConnected(): boolean {
		// Walk parent chain to find root. Using a helper to avoid this-alias.
		return isNodeConnected(this)
	}

	get ownerDocument(): unknown {
		return globalThis.document
	}

	//#endregion Navigation

	//#region Mutation

	appendChild(child: WolfieNodeBase): WolfieNodeBase {
		// Fragment: move children, not the fragment itself (standard DOM behavior)
		if (child instanceof WolfieDocumentFragment) {
			const kids = [...child._wchildren]
			for (const kid of kids) {
				this.appendChild(kid)
			}
			return child
		}

		// Detach from current parent
		if (child._wparent) {
			child._wparent.removeChild(child)
		}

		child._wparent = this
		this._wchildren.push(child)

		// Delegate to core DOM if both are elements/text
		this._coreDomAppend(child)

		return child
	}

	insertBefore(
		newChild: WolfieNodeBase,
		refChild: WolfieNodeBase | null
	): WolfieNodeBase {
		if (!refChild) return this.appendChild(newChild)

		// Fragment: insert all children before refChild
		if (newChild instanceof WolfieDocumentFragment) {
			const kids = [...newChild._wchildren]
			for (const kid of kids) {
				this.insertBefore(kid, refChild)
			}
			return newChild
		}

		// Detach from current parent
		if (newChild._wparent) {
			newChild._wparent.removeChild(newChild)
		}

		const idx = this._wchildren.indexOf(refChild)
		if (idx >= 0) {
			this._wchildren.splice(idx, 0, newChild)
		} else {
			this._wchildren.push(newChild)
		}
		newChild._wparent = this

		// Delegate to core DOM
		this._coreDomInsertBefore(newChild, refChild)

		return newChild
	}

	removeChild(child: WolfieNodeBase): WolfieNodeBase {
		const idx = this._wchildren.indexOf(child)
		if (idx >= 0) {
			this._wchildren.splice(idx, 1)
		}
		child._wparent = null

		// Delegate to core DOM
		this._coreDomRemove(child)

		return child
	}

	replaceChild(
		newChild: WolfieNodeBase,
		oldChild: WolfieNodeBase
	): WolfieNodeBase {
		this.insertBefore(newChild, oldChild)
		this.removeChild(oldChild)
		return oldChild
	}

	append(...nodes: Array<WolfieNodeBase | string>): void {
		for (const node of nodes) {
			if (typeof node === 'string') {
				this.appendChild(new WolfieText(node))
			} else {
				this.appendChild(node)
			}
		}
	}

	before(newNode: WolfieNodeBase): void {
		if (this._wparent) {
			this._wparent.insertBefore(newNode, this)
		}
	}

	after(newNode: WolfieNodeBase): void {
		if (this._wparent) {
			const next = this.nextSibling
			if (next) {
				this._wparent.insertBefore(newNode, next)
			} else {
				this._wparent.appendChild(newNode)
			}
		}
	}

	remove(): void {
		if (this._wparent) {
			this._wparent.removeChild(this)
		}
	}

	replaceWith(newNode: WolfieNodeBase): void {
		if (this._wparent) {
			this._wparent.replaceChild(newNode, this)
		}
	}

	contains(node: WolfieNodeBase | null): boolean {
		if (!node) return false
		let current: WolfieNodeBase | null = node
		while (current) {
			if (current === this) return true
			current = current._wparent
		}
		return false
	}

	cloneNode(deep?: boolean): WolfieNodeBase {
		return this._cloneImpl(deep ?? false)
	}

	get textContent(): string {
		if (this instanceof WolfieText) return this.data
		return this._wchildren.map((c) => c.textContent).join('')
	}

	set textContent(value: string) {
		// Remove all children
		while (this._wchildren.length > 0) {
			const child = this._wchildren[0]
			if (child) this.removeChild(child)
		}
		if (value) {
			this.appendChild(new WolfieText(value))
		}
	}

	//#endregion Mutation

	//#region Protected — override in subclasses

	protected _coreDomAppend(_child: WolfieNodeBase): void {
		// Default: no-op for comment/fragment
	}

	protected _coreDomInsertBefore(
		_newChild: WolfieNodeBase,
		_refChild: WolfieNodeBase
	): void {
		// Default: no-op
	}

	protected _coreDomRemove(_child: WolfieNodeBase): void {
		// Default: no-op
	}

	protected abstract _cloneImpl(deep: boolean): WolfieNodeBase

	//#endregion Protected
}

//#endregion WolfieNodeBase

//#region WolfieElement

/**
 * Wraps a core DOMElement. Each WolfieElement owns one DOMElement from @wolfie/core.
 * All attribute/style/child operations delegate to the core DOM API.
 */
export class WolfieElement extends WolfieNodeBase {
	readonly nodeType = 1
	readonly nodeName: string
	readonly domElement: DOMElement

	// Event handler storage
	private _listeners = new Map<
		string,
		Set<EventListenerOrEventListenerObject>
	>()

	// Svelte V8 shape hints
	declare __click: unknown
	declare __className: unknown
	declare __attributes: unknown
	declare __style: unknown
	declare __e: unknown

	constructor(tagName: string, domEl?: DOMElement) {
		super()
		this.nodeName = tagName
		if (!isElementName(tagName)) {
			throw new Error(`Unknown wolfie element name: "${tagName}"`)
		}
		this.domElement = domEl ?? createNode(tagName, getLayoutTree())

		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'svelte',
				op: 'createElement',
				name: tagName,
				nodeId: this.domElement.layoutNodeId,
			})
		}
	}

	//#region Attributes

	setAttribute(key: string, value: string): void {
		setAttribute(this.domElement, key, value)
	}

	getAttribute(key: string): string | null {
		const val = this.domElement.attributes[key]
		if (val === undefined) return null
		return String(val)
	}

	removeAttribute(key: string): void {
		delete this.domElement.attributes[key]
	}

	setAttributeNS(_ns: string | null, key: string, value: string): void {
		this.setAttribute(key, value)
	}

	hasAttribute(key: string): boolean {
		return key in this.domElement.attributes
	}

	//#endregion Attributes

	//#region className / classList

	get className(): string {
		const cn = this.domElement.attributes['className']
		return cn !== undefined ? String(cn) : ''
	}

	set className(value: string) {
		setAttribute(this.domElement, 'className', value)
	}

	get classList(): {
		add: (...tokens: string[]) => void
		remove: (...tokens: string[]) => void
		toggle: (token: string, force?: boolean) => boolean
		contains: (token: string) => boolean
	} {
		return {
			add: (...tokens: string[]) => {
				const current = new Set(this.className.split(/\s+/).filter(Boolean))
				for (const t of tokens) current.add(t)
				this.className = [...current].join(' ')
			},
			remove: (...tokens: string[]) => {
				const current = new Set(this.className.split(/\s+/).filter(Boolean))
				for (const t of tokens) current.delete(t)
				this.className = [...current].join(' ')
			},
			toggle: (token: string, force?: boolean): boolean => {
				const current = new Set(this.className.split(/\s+/).filter(Boolean))
				const shouldAdd = force !== undefined ? force : !current.has(token)
				if (shouldAdd) {
					current.add(token)
				} else {
					current.delete(token)
				}
				this.className = [...current].join(' ')
				return shouldAdd
			},
			contains: (token: string): boolean => {
				return this.className.split(/\s+/).includes(token)
			},
		}
	}

	//#endregion className / classList

	//#region Style proxy

	get style(): StyleProxy {
		const domEl = this.domElement
		const target: StyleProxy = Object.create(null)
		target.cssText = ''
		const handler: ProxyHandler<StyleProxy> = {
			set(_target, prop, value) {
				if (typeof prop !== 'string') return true
				const merged: Styles = { ...domEl.style, [prop]: value }
				setStyle(domEl, merged)
				if (domEl.layoutNodeId !== undefined && domEl.layoutTree) {
					applyLayoutStyle(domEl.layoutTree, domEl.layoutNodeId, merged)
				}
				scheduleRender()
				return true
			},
			get(_target, prop) {
				if (prop === 'cssText') return ''
				if (typeof prop === 'string') {
					const val = Reflect.get(domEl.style, prop)
					return val !== undefined ? String(val) : ''
				}
				return undefined
			},
		}
		return new Proxy(target, handler)
	}

	//#endregion Style proxy

	//#region Events

	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject
	): void {
		let set = this._listeners.get(type)
		if (!set) {
			set = new Set()
			this._listeners.set(type, set)
		}
		set.add(listener)
	}

	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject
	): void {
		const set = this._listeners.get(type)
		if (set) {
			set.delete(listener)
			if (set.size === 0) this._listeners.delete(type)
		}
	}

	dispatchEvent(event: Event): boolean {
		const set = this._listeners.get(event.type)
		if (set) {
			for (const listener of set) {
				if (typeof listener === 'function') {
					listener(event)
				} else {
					listener.handleEvent(event)
				}
			}
		}
		return true
	}

	//#endregion Events

	//#region Misc DOM compat

	getBoundingClientRect(): {
		x: number
		y: number
		width: number
		height: number
		top: number
		right: number
		bottom: number
		left: number
	} {
		return {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
		}
	}

	get innerHTML(): string {
		return ''
	}

	set innerHTML(_value: string) {
		// Svelte template fallback uses innerHTML on <template> elements.
		// We handle <template> specially in wolfie-document, so this is a no-op stub.
	}

	/** Template compat — `content` returns self so `template.content.cloneNode()` works */
	get content(): WolfieElement {
		return this
	}

	get internal_transform() {
		return this.domElement.internal_transform
	}

	set internal_transform(value) {
		this.domElement.internal_transform = value
	}

	get internal_static() {
		return this.domElement.internal_static
	}

	set internal_static(value) {
		this.domElement.internal_static = value
	}

	get internal_accessibility() {
		return this.domElement.internal_accessibility
	}

	set internal_accessibility(value) {
		this.domElement.internal_accessibility = value
	}

	//#endregion Misc DOM compat

	//#region Core DOM delegation

	protected override _coreDomAppend(child: WolfieNodeBase): void {
		const lt = getLayoutTree()
		if (child instanceof WolfieElement) {
			appendChildNode(this.domElement, child.domElement, lt)
		} else if (child instanceof WolfieText) {
			appendChildNode(this.domElement, child.textNode, lt)
		}
		// WolfieComment: no core DOM node, just tracked in _wchildren
		scheduleRender()
	}

	protected override _coreDomInsertBefore(
		newChild: WolfieNodeBase,
		refChild: WolfieNodeBase
	): void {
		const lt = getLayoutTree()
		const refDomNode =
			refChild instanceof WolfieElement
				? refChild.domElement
				: refChild instanceof WolfieText
					? refChild.textNode
					: undefined

		if (!refDomNode) {
			// ref is a comment — find next non-comment sibling for core DOM positioning
			const siblings = this._wchildren
			const refIdx = siblings.indexOf(refChild)
			let nextCoreSibling: DOMElement | TextNode | undefined
			for (let i = refIdx + 1; i < siblings.length; i++) {
				const sib = siblings[i]
				if (sib instanceof WolfieElement) {
					nextCoreSibling = sib.domElement
					break
				}
				if (sib instanceof WolfieText) {
					nextCoreSibling = sib.textNode
					break
				}
			}

			if (nextCoreSibling) {
				if (newChild instanceof WolfieElement) {
					insertBeforeNode(
						this.domElement,
						newChild.domElement,
						nextCoreSibling,
						lt
					)
				} else if (newChild instanceof WolfieText) {
					insertBeforeNode(
						this.domElement,
						newChild.textNode,
						nextCoreSibling,
						lt
					)
				}
			} else {
				// No core sibling after comment — append
				if (newChild instanceof WolfieElement) {
					appendChildNode(this.domElement, newChild.domElement, lt)
				} else if (newChild instanceof WolfieText) {
					appendChildNode(this.domElement, newChild.textNode, lt)
				}
			}
		} else {
			if (newChild instanceof WolfieElement) {
				insertBeforeNode(this.domElement, newChild.domElement, refDomNode, lt)
			} else if (newChild instanceof WolfieText) {
				insertBeforeNode(this.domElement, newChild.textNode, refDomNode, lt)
			}
		}
		scheduleRender()
	}

	protected override _coreDomRemove(child: WolfieNodeBase): void {
		const lt = getLayoutTree()
		if (child instanceof WolfieElement) {
			removeChildNode(this.domElement, child.domElement, lt)
		} else if (child instanceof WolfieText) {
			removeChildNode(this.domElement, child.textNode, lt)
		}
		// WolfieComment: no core DOM node to remove
		scheduleRender()
	}

	protected override _cloneImpl(deep: boolean): WolfieElement {
		const cloned = new WolfieElement(this.nodeName)
		// Copy attributes
		for (const [key, val] of Object.entries(this.domElement.attributes)) {
			setAttribute(cloned.domElement, key, val)
		}
		// Copy style
		setStyle(cloned.domElement, { ...this.domElement.style })
		if (
			cloned.domElement.layoutNodeId !== undefined &&
			cloned.domElement.layoutTree
		) {
			applyLayoutStyle(
				cloned.domElement.layoutTree,
				cloned.domElement.layoutNodeId,
				cloned.domElement.style
			)
		}
		if (deep) {
			for (const child of this._wchildren) {
				cloned.appendChild(child.cloneNode(true))
			}
		}
		return cloned
	}

	//#endregion Core DOM delegation
}

//#endregion WolfieElement

//#region WolfieText

/**
 * Wraps a core TextNode. Delegates text value changes to setTextNodeValue().
 */
export class WolfieText extends WolfieNodeBase {
	readonly nodeType = 3
	readonly nodeName = '#text'
	readonly textNode: TextNode

	// Svelte V8 shape hint
	declare __t: unknown

	constructor(text?: string) {
		super()
		this.textNode = createTextNode(text ?? '')
	}

	get data(): string {
		return this.textNode.nodeValue
	}

	set data(value: string) {
		setTextNodeValue(this.textNode, value, this.textNode.layoutTree)
		scheduleRender()
	}

	get nodeValue(): string {
		return this.textNode.nodeValue
	}

	set nodeValue(value: string) {
		this.data = value
	}

	override get textContent(): string {
		return this.data
	}

	override set textContent(value: string) {
		this.data = value
	}

	get wholeText(): string {
		return this.data
	}

	protected override _cloneImpl(_deep: boolean): WolfieText {
		return new WolfieText(this.data)
	}
}

//#endregion WolfieText

//#region WolfieComment

/**
 * Dummy node for Svelte's anchor comments ({#if}, {#each}, etc.).
 * No core DOM node — purely tracked in the wrapper tree for sibling navigation.
 *
 * CRITICAL: These must NOT become Taffy children. When Svelte inserts an anchor
 * comment inside a wolfie-text element, initLayoutTreeRecursively early-returns
 * to prevent comments from becoming layout children of text nodes.
 */
export class WolfieComment extends WolfieNodeBase {
	readonly nodeType = 8
	readonly nodeName = '#comment'
	data: string

	constructor(text?: string) {
		super()
		this.data = text ?? ''
	}

	get nodeValue(): string {
		return this.data
	}

	set nodeValue(value: string) {
		this.data = value
	}

	override get textContent(): string {
		return this.data
	}

	override set textContent(value: string) {
		this.data = value
	}

	protected override _cloneImpl(_deep: boolean): WolfieComment {
		return new WolfieComment(this.data)
	}
}

//#endregion WolfieComment

//#region WolfieDocumentFragment

/**
 * Fragment node. When appended to a parent, its children move to the parent
 * (standard DOM fragment semantics). Used by Svelte for {#if}/{#each} blocks.
 */
export class WolfieDocumentFragment extends WolfieNodeBase {
	readonly nodeType = 11
	readonly nodeName = '#document-fragment'

	protected override _cloneImpl(deep: boolean): WolfieDocumentFragment {
		const frag = new WolfieDocumentFragment()
		if (deep) {
			for (const child of this._wchildren) {
				frag.appendChild(child.cloneNode(true))
			}
		}
		return frag
	}
}

//#endregion WolfieDocumentFragment
