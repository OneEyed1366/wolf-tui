import { applyLayoutStyle, type LayoutTree } from '@wolfie/core'
import { WolfieElement } from './wolfie-element.js'

/**
 * Recursively walk the wrapper tree starting from `element` and ensure every
 * WolfieElement has a Taffy layout node.
 *
 * CRITICAL: early-return when nodeName === 'wolfie-text'.
 * Svelte's {#if} blocks insert anchor comment (WolfieComment) nodes INSIDE
 * wolfie-text elements. Without this guard, initLayoutTreeRecursively would
 * add them as Taffy children of wolfie-text, turning it from a leaf node
 * (text-measured by Taffy) into a flex container with zero-size children
 * — resulting in width=0 for all text.
 */
export function initLayoutTreeRecursively(
	element: WolfieElement,
	layoutTree: LayoutTree
): void {
	// wolfie-text is a leaf: Taffy measures it via setTextDimensions.
	// Recursing into its children would corrupt layout — abort.
	if (element.nodeName === 'wolfie-text') return

	const domEl = element.domElement

	// Already initialized — skip
	if (domEl.layoutNodeId !== undefined) return

	domEl.layoutNodeId = layoutTree.createNode({})
	domEl.layoutTree = layoutTree

	if (domEl.style) {
		applyLayoutStyle(layoutTree, domEl.layoutNodeId, domEl.style)
	}

	for (const child of element._wchildren) {
		if (child instanceof WolfieElement) {
			initLayoutTreeRecursively(child, layoutTree)
		}
	}
}
