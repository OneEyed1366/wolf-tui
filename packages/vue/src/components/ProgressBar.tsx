import { defineComponent, ref, type PropType } from 'vue'
import { cloneVNode } from 'vue'
import {
	renderProgressBar,
	defaultProgressBarTheme,
	type ProgressBarRenderTheme,
} from '@wolfie/shared'
import { measureElement, type DOMElement } from '@wolfie/core'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface ProgressBarProps {
	/**
	 * Progress.
	 * Must be between 0 and 100.
	 *
	 * @default 0
	 */
	value: number
}
//#endregion Types

export { defaultProgressBarTheme as progressBarTheme }
export type { ProgressBarRenderTheme as ProgressBarTheme }

//#region Component
export const ProgressBar = defineComponent({
	name: 'ProgressBar',
	props: {
		value: {
			type: Number as PropType<number>,
			required: true,
		},
	},
	setup(props) {
		const width = ref(0)

		const setRef = (el: unknown) => {
			const domEl = el as DOMElement | null
			if (domEl) {
				const dimensions = measureElement(domEl)
				if (dimensions.width !== width.value) {
					width.value = dimensions.width
				}
			}
		}

		return () => {
			const vnode = wNodeToVue(
				renderProgressBar(
					{ value: props.value, width: width.value },
					defaultProgressBarTheme
				)
			)
			return cloneVNode(vnode, { ref: setRef })
		}
	},
})
//#endregion Component

export type { ProgressBarProps as Props, ProgressBarProps as IProps }
