import { defineComponent, type PropType } from 'vue'
import type { SpinnerName } from 'cli-spinners'
import { useSpinner, type UseSpinnerProps } from '../composables/use-spinner'
import {
	renderSpinner,
	defaultSpinnerTheme,
	type SpinnerRenderTheme,
} from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface SpinnerProps extends UseSpinnerProps {
	/**
	 * Label to show near the spinner.
	 */
	label?: string
}
//#endregion Types

//#region Component
export const Spinner = defineComponent({
	name: 'Spinner',
	props: {
		type: {
			type: String as PropType<SpinnerName>,
			default: 'dots',
		},
		label: {
			type: String,
			default: undefined,
		},
	},
	setup(props) {
		const spinnerResult = useSpinner({ type: props.type })
		const { styles } = defaultSpinnerTheme

		return () => {
			return wNodeToVue(
				renderSpinner(
					{ frame: spinnerResult.frame, label: props.label },
					{ styles }
				)
			)
		}
	},
})
//#endregion Component

export {
	defaultSpinnerTheme as spinnerTheme,
	type SpinnerRenderTheme as SpinnerTheme,
}
export type { SpinnerProps as Props, SpinnerProps as IProps }
