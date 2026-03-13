import { defineComponent, type PropType, type VNode } from 'vue'
import {
	renderAlert,
	defaultAlertTheme,
	type AlertRenderTheme,
	type AlertVariant,
} from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export { type AlertVariant }

export interface AlertProps {
	/**
	 * Message content.
	 */
	children?: VNode | VNode[]

	/**
	 * Variant, which determines the color of the alert.
	 */
	variant: AlertVariant

	/**
	 * Title to show above the message.
	 */
	title?: string
}
//#endregion Types

//#region Helpers
function extractTextFromSlot(children: VNode[] | undefined): string {
	if (!children || children.length === 0) return ''
	const firstChild = children[0]
	if (!firstChild) return ''
	if (typeof firstChild === 'string') return firstChild
	if (typeof firstChild === 'object' && 'children' in firstChild) {
		const nodeChildren = firstChild.children
		if (typeof nodeChildren === 'string') return nodeChildren
		if (Array.isArray(nodeChildren) && nodeChildren.length > 0) {
			const text = nodeChildren[0]
			if (typeof text === 'string') return text
		}
	}
	return ''
}
//#endregion Helpers

//#region Component
export const Alert = defineComponent({
	name: 'Alert',
	props: {
		variant: {
			type: String as PropType<AlertVariant>,
			required: true,
		},
		title: {
			type: String,
			default: undefined,
		},
	},
	setup(props, { slots }) {
		const { styles, config } = defaultAlertTheme

		return () => {
			const { variant, title } = props
			const message = extractTextFromSlot(slots.default?.())
			return wNodeToVue(
				renderAlert({ variant, title, message }, { styles, config })
			)
		}
	},
})
//#endregion Component

export { defaultAlertTheme as alertTheme, type AlertRenderTheme as AlertTheme }
export type { AlertProps as Props, AlertProps as IProps }
