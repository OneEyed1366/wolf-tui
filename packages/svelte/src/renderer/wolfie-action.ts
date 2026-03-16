import { setStyle, applyLayoutStyle, type Styles } from '@wolfie/core'
import type { WolfieElement } from './wolfie-element.js'

//#region Types
interface WolfiePropsPayload {
	style?: Styles
	internal_transform?: (text: string, index: number) => string
	internal_static?: boolean
}
//#endregion Types

//#region wolfieProps action
/**
 * Svelte action that applies style objects, internal_transform functions, and
 * internal_static flags directly to a WolfieElement's core DOMElement.
 *
 * Svelte's compiled `set_custom_element_data()` calls `setAttribute()` which
 * stringifies objects to '[object Object]' and functions to 'function...'.
 * This action bypasses that by writing to the core DOM API directly.
 */
export function wolfieProps(node: WolfieElement, props: WolfiePropsPayload) {
	function apply(p: WolfiePropsPayload) {
		if (p.style) {
			setStyle(node.domElement, p.style)
			if (
				node.domElement.layoutNodeId !== undefined &&
				node.domElement.layoutTree
			) {
				applyLayoutStyle(
					node.domElement.layoutTree,
					node.domElement.layoutNodeId,
					p.style
				)
			}
		}

		if (p.internal_transform !== undefined) {
			node.domElement.internal_transform = p.internal_transform
		}

		if (p.internal_static !== undefined) {
			node.domElement.internal_static = p.internal_static
		}
	}

	apply(props)

	return {
		update(newProps: WolfiePropsPayload) {
			apply(newProps)
		},
		destroy() {
			// No cleanup needed — DOM element lifecycle handles teardown
		},
	}
}
//#endregion wolfieProps action
