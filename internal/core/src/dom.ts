import { logger } from './logger'
import { type LayoutTree } from './layout-types'
import { type IStyles } from './styles'
import { type IOutputTransformer } from './render-node-to-output'

type IWolfieNode = {
	parentNode: DOMElement | undefined
	layoutNodeId?: number
	// Direct reference to layout tree for Taffy (avoids root traversal during reconciliation)
	layoutTree?: LayoutTree
	internal_static?: boolean
	style: IStyles
}

export type ITextName = '#text'
export type IElementNames =
	| 'wolfie-root'
	| 'wolfie-box'
	| 'wolfie-text'
	| 'wolfie-virtual-text'

export type INodeNames = IElementNames | ITextName

export type DOMElement = {
	nodeName: IElementNames
	attributes: Record<string, DOMNodeAttribute>
	childNodes: DOMNode[]
	internal_transform?: IOutputTransformer
	internal_isHostElement?: boolean

	internal_accessibility?: {
		role?:
			| 'button'
			| 'checkbox'
			| 'combobox'
			| 'list'
			| 'listbox'
			| 'listitem'
			| 'menu'
			| 'menuitem'
			| 'option'
			| 'progressbar'
			| 'radio'
			| 'radiogroup'
			| 'tab'
			| 'tablist'
			| 'table'
			| 'textbox'
			| 'timer'
			| 'toolbar'
		state?: {
			busy?: boolean
			checked?: boolean
			disabled?: boolean
			expanded?: boolean
			multiline?: boolean
			multiselectable?: boolean
			readonly?: boolean
			required?: boolean
			selected?: boolean
		}
	}

	// Internal properties
	isStaticDirty?: boolean
	staticNode?: DOMElement
	onComputeLayout?: () => void
	onRender?: () => void
	onImmediateRender?: () => void
} & IWolfieNode

export type TextNode = {
	nodeName: ITextName
	nodeValue: string
} & IWolfieNode

export type DOMNode<T = { nodeName: INodeNames }> = T extends {
	nodeName: infer U
}
	? U extends '#text'
		? TextNode
		: DOMElement
	: never

export type DOMNodeAttribute = boolean | string | number

/**
 * Type guard for DOMElement
 */
export const isElement = (node: DOMNode): node is DOMElement => {
	return node.nodeName !== '#text'
}

/**
 * Type guard for TextNode
 */
export const isText = (node: DOMNode): node is TextNode => {
	return node.nodeName === '#text'
}

export const createNode = (
	nodeName: IElementNames,
	layoutTree?: LayoutTree
): DOMElement => {
	const node: DOMElement = {
		nodeName,
		style: {},
		attributes: {},
		childNodes: [],
		parentNode: undefined,
		layoutNodeId:
			nodeName === 'wolfie-virtual-text' || !layoutTree
				? undefined
				: layoutTree.createNode({}),
		// Store direct reference to layoutTree for use in appendChild/insertBefore
		layoutTree,

		internal_accessibility: {},
	}

	// Note: Text measurement for Taffy handled via setTextDimensions() called from renderer

	logger.log({
		ts: performance.now(),
		cat: 'dom',
		op: 'createNode',
		name: nodeName,
		nodeId: node.layoutNodeId,
	})
	return node
}

export const appendChildNode = (
	node: DOMElement,
	childNode: DOMNode,
	_layoutTree?: LayoutTree // Kept for API compatibility, but node.layoutTree is preferred
): void => {
	// Use node's layoutTree directly (avoids traversal during initial render)
	const effectiveLayoutTree = node.layoutTree ?? _layoutTree

	if (childNode.parentNode) {
		removeChildNode(childNode.parentNode, childNode, effectiveLayoutTree)
	}

	childNode.parentNode = node
	logger.log({
		ts: performance.now(),
		cat: 'dom',
		op: 'appendChild',
		parentName: node.nodeName,
		parentId: node.layoutNodeId,
		childName: childNode.nodeName,
		childId: (childNode as { layoutNodeId?: number }).layoutNodeId,
	})
	node.childNodes.push(childNode)

	// Propagate layoutTree to child if it doesn't have one
	if (!childNode.layoutTree && effectiveLayoutTree) {
		childNode.layoutTree = effectiveLayoutTree
	}

	if (
		childNode.layoutNodeId !== undefined &&
		node.layoutNodeId !== undefined &&
		effectiveLayoutTree
	) {
		const index = effectiveLayoutTree.getChildCount(node.layoutNodeId)
		effectiveLayoutTree.insertChild(
			node.layoutNodeId,
			childNode.layoutNodeId,
			index
		)
	}

	if (
		node.nodeName === 'wolfie-text' ||
		node.nodeName === 'wolfie-virtual-text'
	) {
		markNodeAsDirty(node, effectiveLayoutTree)
	}
}

export const insertBeforeNode = (
	node: DOMElement,
	newChildNode: DOMNode,
	beforeChildNode: DOMNode,
	_layoutTree?: LayoutTree
): void => {
	// Use node's layoutTree directly (avoids traversal during initial render)
	const effectiveLayoutTree = node.layoutTree ?? _layoutTree

	if (newChildNode.parentNode) {
		removeChildNode(newChildNode.parentNode, newChildNode, effectiveLayoutTree)
	}

	newChildNode.parentNode = node
	logger.log({
		ts: performance.now(),
		cat: 'dom',
		op: 'insertBefore',
		parentName: node.nodeName,
		parentId: node.layoutNodeId,
		childName: newChildNode.nodeName,
		childId: (newChildNode as { layoutNodeId?: number }).layoutNodeId,
	})

	// Propagate layoutTree to child if it doesn't have one
	if (!newChildNode.layoutTree && effectiveLayoutTree) {
		newChildNode.layoutTree = effectiveLayoutTree
	}

	const index = node.childNodes.indexOf(beforeChildNode)
	if (index >= 0) {
		node.childNodes.splice(index, 0, newChildNode)

		if (
			newChildNode.layoutNodeId !== undefined &&
			node.layoutNodeId !== undefined &&
			effectiveLayoutTree
		) {
			// Calculate layout index by counting only siblings with layoutNodeId before anchor
			// DOM childNodes may contain text nodes that don't have layout IDs
			let layoutIndex = 0
			for (let i = 0; i < index; i++) {
				if (node.childNodes[i]?.layoutNodeId !== undefined) {
					layoutIndex++
				}
			}
			effectiveLayoutTree.insertChild(
				node.layoutNodeId,
				newChildNode.layoutNodeId,
				layoutIndex
			)
		}

		if (
			node.nodeName === 'wolfie-text' ||
			node.nodeName === 'wolfie-virtual-text'
		) {
			markNodeAsDirty(node, effectiveLayoutTree)
		}

		return
	}

	node.childNodes.push(newChildNode)

	if (
		newChildNode.layoutNodeId !== undefined &&
		node.layoutNodeId !== undefined &&
		effectiveLayoutTree
	) {
		effectiveLayoutTree.insertChild(
			node.layoutNodeId,
			newChildNode.layoutNodeId,
			effectiveLayoutTree.getChildCount(node.layoutNodeId)
		)
	}

	if (
		node.nodeName === 'wolfie-text' ||
		node.nodeName === 'wolfie-virtual-text'
	) {
		markNodeAsDirty(node, effectiveLayoutTree)
	}
}

export const removeChildNode = (
	node: DOMElement,
	removeNode: DOMNode,
	layoutTree?: LayoutTree
): void => {
	if (
		removeNode.layoutNodeId !== undefined &&
		removeNode.parentNode?.layoutNodeId !== undefined &&
		layoutTree
	) {
		layoutTree.removeChild(
			removeNode.parentNode.layoutNodeId,
			removeNode.layoutNodeId
		)
	}

	// WHY: log before clearing parentNode so we can still read parent info
	logger.log({
		ts: performance.now(),
		cat: 'dom',
		op: 'removeChild',
		parentName: node.nodeName,
		parentId: node.layoutNodeId,
		childName: removeNode.nodeName,
		childId: (removeNode as { layoutNodeId?: number }).layoutNodeId,
	})
	removeNode.parentNode = undefined

	const index = node.childNodes.indexOf(removeNode)
	if (index >= 0) {
		node.childNodes.splice(index, 1)
	}

	if (
		node.nodeName === 'wolfie-text' ||
		node.nodeName === 'wolfie-virtual-text'
	) {
		markNodeAsDirty(node, layoutTree)
	}
}

export const setAttribute = (
	node: DOMElement,
	key: string,
	value: DOMNodeAttribute
): void => {
	if (key === 'internal_accessibility') {
		node.internal_accessibility = value as DOMElement['internal_accessibility']
		return
	}

	node.attributes[key] = value
}

export const setStyle = (node: DOMNode, style: IStyles): void => {
	node.style = style
}

export const createTextNode = (text: string): TextNode => {
	const node: TextNode = {
		nodeName: '#text',
		nodeValue: text,
		layoutNodeId: undefined, // Text nodes don't have layout nodes
		parentNode: undefined,
		style: {},
	}

	setTextNodeValue(node, text)

	// WHY: String() guard — adapters may pass non-string primitives; slice is eager
	logger.log({
		ts: performance.now(),
		cat: 'dom',
		op: 'createText',
		preview: String(text).slice(0, 80),
	})
	return node
}

const findClosestLayoutNodeId = (node?: DOMNode): number | undefined => {
	if (!node?.parentNode) {
		return undefined
	}

	return node.layoutNodeId ?? findClosestLayoutNodeId(node.parentNode)
}

export const markNodeAsDirty = (
	node?: DOMNode,
	layoutTree?: LayoutTree
): void => {
	if (layoutTree) {
		const layoutNodeId = findClosestLayoutNodeId(node)
		if (layoutNodeId !== undefined) {
			layoutTree.markDirty(layoutNodeId)
			// WHY: guard with logger.enabled — markNodeAsDirty is called from every text change
			// and every appendChild to text nodes; it's one of the hottest paths in the renderer
			if (logger.enabled) {
				logger.log({
					ts: performance.now(),
					cat: 'dom',
					op: 'markDirty',
					nodeId: layoutNodeId,
				})
			}
		}
	}
}

export const setTextNodeValue = (
	node: TextNode,
	text: string,
	layoutTree?: LayoutTree
): void => {
	if (typeof text !== 'string') {
		text = String(text)
	}

	node.nodeValue = text
	if (logger.enabled) {
		// WHY: guard — called on every keystroke and game tick text update
		logger.log({
			ts: performance.now(),
			cat: 'dom',
			op: 'setTextValue',
			len: text.length,
		})
	}
	markNodeAsDirty(node, layoutTree ?? node.layoutTree)
}

// Re-export LayoutTree type for consumers
export type { LayoutTree } from './layout-types'
