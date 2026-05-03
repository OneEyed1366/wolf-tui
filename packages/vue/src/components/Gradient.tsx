import {
	defineComponent,
	type PropType,
	type VNode,
	type DefineComponent,
} from 'vue'
import {
	renderGradient,
	defaultGradientTheme,
	type GradientRenderTheme,
	type GradientName,
} from '@wolf-tui/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface GradientProps {
	/**
	 * Text to paint with the gradient.
	 */
	children?: VNode | VNode[] | string

	/**
	 * Named gradient preset.
	 *
	 * @default "rainbow"
	 */
	name?: GradientName

	/**
	 * Custom gradient stops (overrides `name` when provided).
	 */
	colors?: string[]
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
export const Gradient: DefineComponent<{
	name?: GradientName
	colors?: string[]
}> = defineComponent({
	name: 'Gradient',
	props: {
		name: {
			type: String as PropType<GradientName>,
			default: undefined,
		},
		colors: {
			type: Array as PropType<string[]>,
			default: undefined,
		},
	},
	setup(props, { slots }) {
		return () => {
			const { name, colors } = props
			const { styles } = defaultGradientTheme

			const children = slots.default?.()
			const text = extractTextFromSlot(children) ?? String(children?.[0] ?? '')

			return wNodeToVue(renderGradient({ text, name, colors }, { styles }))
		}
	},
})
//#endregion Component

export {
	defaultGradientTheme as gradientTheme,
	type GradientRenderTheme as GradientTheme,
	type GradientName,
}
export type { GradientProps as Props, GradientProps as IProps }
