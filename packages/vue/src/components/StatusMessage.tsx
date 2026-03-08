import { defineComponent, type PropType, type VNode } from 'vue'
import {
	renderStatusMessage,
	defaultStatusMessageTheme,
	type StatusMessageRenderTheme,
	type StatusMessageVariant,
} from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export { type StatusMessageVariant }

export interface StatusMessageProps {
	/**
	 * Message content.
	 */
	children?: VNode | VNode[]

	/**
	 * Variant, which determines the color used in the status message.
	 */
	variant: StatusMessageVariant
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
export const StatusMessage = defineComponent({
	name: 'StatusMessage',
	props: {
		variant: {
			type: String as PropType<StatusMessageVariant>,
			required: true,
		},
	},
	setup(props, { slots }) {
		const { styles, config } = defaultStatusMessageTheme

		return () => {
			const { variant } = props
			const message = extractTextFromSlot(slots.default?.())
			return wNodeToVue(
				renderStatusMessage({ variant, message }, { styles, config })
			)
		}
	},
})
//#endregion Component

export {
	defaultStatusMessageTheme as statusMessageTheme,
	type StatusMessageRenderTheme as StatusMessageTheme,
}
export type { StatusMessageProps as Props, StatusMessageProps as IProps }
