import { defineComponent, ref, h } from 'vue'
import { measureElement, type DOMElement } from '@wolfie/core'
import {
	renderProgressBar,
	defaultProgressBarTheme,
	type ProgressBarRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region ProgressBarComponent
export const ProgressBar = defineComponent({
	name: 'ProgressBar',
	props: {
		value: { type: Number, required: true as const },
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

		const theme =
			useComponentTheme<ProgressBarRenderTheme>('ProgressBar') ??
			defaultProgressBarTheme

		return () =>
			// WHY: wolfie-box wrapper owns container style + ref for measurement.
			// renderProgressBar returns bars only (no container).
			h('wolfie-box', { ref: setRef, style: { flexGrow: 1, minWidth: 0 } }, [
				wNodeToVue(
					renderProgressBar({ value: props.value, width: width.value }, theme)
				),
			])
	},
})
//#endregion ProgressBarComponent

export type ProgressBarProps = { value: number }
export type { ProgressBarRenderTheme as ProgressBarTheme }
export { defaultProgressBarTheme as progressBarTheme }
export type { ProgressBarProps as Props, ProgressBarProps as IProps }
