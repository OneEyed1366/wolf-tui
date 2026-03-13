import { h, type VNode } from 'vue'
import type { WNode } from '@wolfie/shared'

//#region wNodeToVue
/**
 * Converts a framework-agnostic WNode descriptor to a Vue VNode.
 * The `key` field on WNode is passed as Vue's key prop for list reconciliation.
 *
 * Called inside Vue's render function (the function returned from setup()),
 * so Vue's reactive tracking system automatically picks up signal reads.
 */
export function wNodeToVue(node: WNode): VNode {
	const children = node.children.map((child) =>
		typeof child === 'string' ? child : wNodeToVue(child)
	)

	const props =
		node.key !== undefined ? { ...node.props, key: node.key } : node.props

	return h(node.type, props, children)
}
//#endregion wNodeToVue
