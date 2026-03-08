import {
	defineComponent,
	type PropType,
	type VNode,
	type DefineComponent,
} from 'vue'
import type { Styles } from '@wolfie/core'
import {
	renderBadge,
	defaultBadgeTheme,
	type BadgeRenderTheme,
} from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface BadgeProps {
	/**
	 * Label content.
	 */
	children?: VNode | VNode[] | string

	/**
	 * Color.
	 *
	 * @default "magenta"
	 */
	color?: Styles['color']
}
//#endregion Types

//#region Helpers
function extractTextFromSlot(children: VNode[] | undefined): string | null {
	if (!children || children.length === 0) return null

	const firstChild = children[0]
	if (!firstChild) return null

	if (typeof firstChild === 'string') {
		return firstChild
	}

	if (
		firstChild &&
		typeof firstChild === 'object' &&
		'children' in firstChild
	) {
		const nodeChildren = firstChild.children
		if (typeof nodeChildren === 'string') {
			return nodeChildren
		}
		if (Array.isArray(nodeChildren) && nodeChildren.length > 0) {
			const text = nodeChildren[0]
			if (typeof text === 'string') {
				return text
			}
		}
	}

	return null
}
//#endregion Helpers

//#region Component
export const Badge: DefineComponent<{ color?: Styles['color'] }> =
	defineComponent({
		name: 'Badge',
		props: {
			color: {
				type: String as PropType<Styles['color']>,
				default: 'magenta',
			},
		},
		setup(props, { slots }) {
			return () => {
				const { color } = props
				const { styles } = defaultBadgeTheme

				const children = slots.default?.()
				const text = extractTextFromSlot(children)
				const label = text ? text.toUpperCase() : String(children?.[0] ?? '')

				return wNodeToVue(renderBadge({ label, color }, { styles }))
			}
		},
	})
//#endregion Component

export { defaultBadgeTheme as badgeTheme, type BadgeRenderTheme as BadgeTheme }
export type { BadgeProps as Props, BadgeProps as IProps }
