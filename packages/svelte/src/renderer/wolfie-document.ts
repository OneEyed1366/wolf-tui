import { createNode, appendChildNode } from '@wolfie/core'
import type { WolfieNodeBase } from './wolfie-element'
import {
	WolfieDocumentFragment,
	WolfieElement,
	WolfieText,
	WolfieComment,
	unwrap,
	type NodeOpsConfig,
	type WolfieNode,
} from './wolfie-element'

//#region Minimal HTML Parser
// WHY: Svelte 5's from_html() sets template.innerHTML with static HTML like:
//   '<wolfie-box><!----></wolfie-box>'
//   '<wolfie-text> </wolfie-text>'
// We parse this into a WolfieDocumentFragment containing wrapper nodes.
// Only needs to handle: wolfie-* elements, comments (<!--...-->), text nodes.
// Full HTML spec compliance is not required — Svelte generates well-formed markup.
function parseTemplateHtml(
	html: string,
	cfg: NodeOpsConfig
): WolfieDocumentFragment {
	const frag = new WolfieDocumentFragment()
	let i = 0

	function parseChildren(parent: WolfieNodeBase): void {
		while (i < html.length) {
			if (html.startsWith('<!--', i)) {
				// Comment node: <!--...-->
				const closeIdx = html.indexOf('-->', i + 4)
				const data = closeIdx >= 0 ? html.slice(i + 4, closeIdx) : ''
				parent._wAddChild(new WolfieComment(data, cfg))
				i = closeIdx >= 0 ? closeIdx + 3 : html.length
			} else if (html.startsWith('<!>', i)) {
				// WHY: Svelte 5 compiler emits `<!>` as a shorthand for an empty anchor
				// comment node (browsers parse it as <!---->). Our parser must handle it
				// explicitly since we don't run a full HTML parser.
				parent._wAddChild(new WolfieComment('', cfg))
				i += 3
			} else if (html[i] === '<') {
				if (html[i + 1] === '/') {
					// Closing tag — return to caller
					i = html.indexOf('>', i + 2)
					if (i >= 0) i++
					else i = html.length
					return
				}
				// Opening tag
				const tagEnd = html.indexOf('>', i + 1)
				if (tagEnd < 0) {
					i = html.length
					return
				}
				const tagRaw = html.slice(i + 1, tagEnd)
				const isSelfClose = tagRaw.endsWith('/')
				const tagName = tagRaw
					.replace(/\/$/, '')
					.split(/[\s>]/)[0]!
					.toLowerCase()
				const wolfieTag = tagName.startsWith('wolfie-')
					? tagName
					: `wolfie-${tagName}`
				// WHY: Create without layoutTree — will be assigned by
				// initLayoutTreeRecursively when the clone is inserted into live DOM.
				const rawEl = createNode(wolfieTag as any)
				const wrapper = new WolfieElement(rawEl, cfg)
				parent._wAddChild(wrapper)
				i = tagEnd + 1
				if (!isSelfClose) {
					parseChildren(wrapper)
					// WHY: After parsing children, sync raw DOMElement hierarchy so that
					// cloneNode can build correct rawClone.childNodes via appendChildNode.
					for (const child of wrapper._wchildren) {
						appendChildNode(rawEl, unwrap(child as WolfieNode))
					}
				}
			} else {
				// Text node
				const nextTag = html.indexOf('<', i)
				const text = nextTag >= 0 ? html.slice(i, nextTag) : html.slice(i)
				if (text) {
					parent._wAddChild(new WolfieText(text, cfg))
				}
				i = nextTag >= 0 ? nextTag : html.length
			}
		}
	}

	parseChildren(frag)
	return frag
}
//#endregion Minimal HTML Parser

//#region WolfieTemplateElement
// WHY: Svelte's from_html() creates a <template> element and sets innerHTML,
// then reads .content to get a DocumentFragment.
// create_element('template') → document.createElementNS(ns, 'template')
// elem.innerHTML = html → our parser produces a WolfieDocumentFragment
// elem.content → the parsed fragment
class WolfieTemplateElement {
	private _content: WolfieDocumentFragment = new WolfieDocumentFragment()
	readonly nodeType = 1
	readonly nodeName = 'TEMPLATE'

	constructor(private cfg: NodeOpsConfig) {}

	set innerHTML(html: string) {
		// WHY: create_fragment_from_html replaces '<!>' with '<!---->' before
		// setting innerHTML. Our parser handles '<!---->' as comment nodes.
		this._content = parseTemplateHtml(html, this.cfg)
	}

	get content(): WolfieDocumentFragment {
		return this._content
	}
}
//#endregion WolfieTemplateElement

//#region WolfieDocument
// WHY: Replaces globalThis.document before Svelte's mount() is called.
// All document.createElement / createTextNode / createComment calls from
// Svelte's runtime are intercepted and return wolfie wrapper objects.
export class WolfieDocument {
	constructor(private cfg: NodeOpsConfig) {}

	createElement(tag: string): WolfieElement | WolfieTemplateElement {
		if (tag === 'template' || tag === 'TEMPLATE') {
			return new WolfieTemplateElement(this.cfg) as any
		}
		const wolfieTag = tag.startsWith('wolfie-') ? tag : `wolfie-${tag}`
		const el = createNode(wolfieTag as any)
		return new WolfieElement(el, this.cfg)
	}

	// WHY: createElementNS is called by Svelte's create_element() helper with
	// NAMESPACE_HTML ('http://www.w3.org/1999/xhtml') for all standard elements.
	createElementNS(
		_ns: string,
		tag: string,
		_opts?: unknown
	): WolfieElement | WolfieTemplateElement {
		return this.createElement(tag)
	}

	createTextNode(value: string): WolfieText {
		return new WolfieText(value, this.cfg)
	}

	createComment(data = ''): WolfieComment {
		return new WolfieComment(data, this.cfg)
	}

	// WHY: createDocumentFragment() is called by comment() and create_fragment()
	// in Svelte's template.js to create placeholder fragment containers.
	createDocumentFragment(): WolfieDocumentFragment {
		return new WolfieDocumentFragment()
	}

	// WHY: importNode(node, true) is equivalent to cloneNode(true).
	// Used by from_html() when TEMPLATE_USE_IMPORT_NODE flag is set or in Firefox.
	importNode(node: WolfieNodeBase, deep = true): WolfieNodeBase {
		return node.cloneNode(deep)
	}

	// WHY: Stubs for code that checks document.head / document.body existence.
	get head() {
		return { appendChild: () => {} }
	}
	get body() {
		return { appendChild: () => {} }
	}
}
//#endregion WolfieDocument
