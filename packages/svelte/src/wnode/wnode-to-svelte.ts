import type { WNode } from '@wolfie/shared'
import { setStyle, applyLayoutStyle, type Styles } from '@wolfie/core'
import { WolfieElement, WolfieText } from '../renderer/wolfie-element.js'

//#region wNodeToSvelte
/**
 * Converts a framework-agnostic WNode descriptor to a WolfieElement tree.
 *
 * Creates wolfie-box/wolfie-text elements programmatically via the DOM bridge,
 * bypassing Svelte's compiled `set_custom_element_data()` which stringifies
 * objects and functions. Style objects are applied directly through `setStyle()`
 * and `applyLayoutStyle()`, ensuring proper Taffy layout integration.
 *
 * WNode render functions produce fully-computed styles, so no className
 * resolution or context-based defaults are needed here.
 */
export function wNodeToSvelte(node: WNode): WolfieElement {
	const el = new WolfieElement(node.type)

	// Apply style directly to the core DOM element — bypasses Svelte's
	// set_attribute which would stringify the object to '[object Object]'
	if (node.props.style) {
		const styleObj = node.props.style satisfies Partial<Styles>
		setStyle(el.domElement, styleObj)
		if (el.domElement.layoutNodeId !== undefined && el.domElement.layoutTree) {
			applyLayoutStyle(
				el.domElement.layoutTree,
				el.domElement.layoutNodeId,
				styleObj
			)
		}
	}

	// Apply internal_transform directly on domElement — function prop would be
	// stringified by Svelte's setAttribute
	if (node.props.internal_transform) {
		el.domElement.internal_transform = node.props.internal_transform
	}

	// Apply accessibility props as string attributes — safe for setAttribute
	if (node.props['aria-label'] !== undefined) {
		el.setAttribute('aria-label', node.props['aria-label'])
	}
	if (node.props['aria-hidden'] !== undefined) {
		el.setAttribute('aria-hidden', String(node.props['aria-hidden']))
	}
	if (node.props['aria-role'] !== undefined) {
		el.setAttribute('aria-role', node.props['aria-role'])
	}

	// Build children recursively
	for (const child of node.children) {
		if (typeof child === 'string') {
			el.appendChild(new WolfieText(child))
		} else {
			el.appendChild(wNodeToSvelte(child))
		}
	}

	return el
}
//#endregion wNodeToSvelte

//#region mountWNode action
/**
 * Svelte action for reactive WNode mounting into a container element.
 *
 * On create and update: clears container children, builds a new WNode subtree
 * via wNodeToSvelte, then moves the root's children into the container.
 * Root-level style is also applied to the container so the WNode's outermost
 * layout props take effect on the container itself.
 */
export function mountWNode(container: WolfieElement, wnode: WNode) {
	function apply(node: WNode) {
		// Clear existing children
		while (container.firstChild) {
			container.removeChild(container.firstChild)
		}

		// Build full WNode tree
		const tree = wNodeToSvelte(node)

		// Move children from tree root into container
		const kids = [...tree._wchildren]
		for (const kid of kids) {
			container.appendChild(kid)
		}

		// Copy root-level style to container so outer layout is correct
		if (node.props.style) {
			const styleObj = node.props.style satisfies Partial<Styles>
			setStyle(container.domElement, styleObj)
			if (
				container.domElement.layoutNodeId !== undefined &&
				container.domElement.layoutTree
			) {
				applyLayoutStyle(
					container.domElement.layoutTree,
					container.domElement.layoutNodeId,
					styleObj
				)
			}
		}
	}

	apply(wnode)

	return {
		update(newWnode: WNode) {
			apply(newWnode)
		},
		destroy() {
			// Cleanup: remove all children
			while (container.firstChild) {
				container.removeChild(container.firstChild)
			}
		},
	}
}
//#endregion mountWNode action
