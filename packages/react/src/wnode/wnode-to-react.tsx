import React from 'react'
import type { ReactElement } from 'react'
import type { WNode } from '@wolfie/shared'

//#region wNodeToReact
/**
 * Converts a framework-agnostic WNode descriptor to a React element.
 * The `key` field on WNode is passed as the React reconciler key so that
 * list items (e.g. Select options) are diffed correctly.
 */
export function wNodeToReact(node: WNode, index?: number): ReactElement {
	const children = node.children.map((child, i) =>
		typeof child === 'string' ? child : wNodeToReact(child, i)
	)

	return React.createElement(
		node.type,
		{ key: node.key ?? index, ...node.props },
		...children
	)
}
//#endregion wNodeToReact
