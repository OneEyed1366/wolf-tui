import { type JSX } from 'solid-js'
import type { WNode } from '@wolfie/shared'

//#region wNodeToSolid
/**
 * Converts a framework-agnostic WNode descriptor to a Solid JSX element.
 *
 * Creates wolfie-box/wolfie-text native elements directly, bypassing the
 * high-level Box/Text component layers (which add context-based defaults and
 * className resolution). The WNode's style is already fully computed by the
 * render function, so the native elements are sufficient.
 *
 * Must be called within a Solid reactive context. Components should return
 * `() => wNodeToSolid(renderXxx(...))` so that signal reads inside renderXxx
 * are tracked and the output updates when state changes.
 */
export function wNodeToSolid(node: WNode): JSX.Element {
	const children = node.children.map((child) =>
		typeof child === 'string' ? child : wNodeToSolid(child)
	)

	// wolfie-box and wolfie-text are declared as 'any' in jsx.d.ts so
	// the spread is safe without a cast.
	if (node.type === 'wolfie-box') {
		return <wolfie-box {...(node.props as any)}>{children}</wolfie-box>
	}

	return <wolfie-text {...(node.props as any)}>{children}</wolfie-text>
}
//#endregion wNodeToSolid
