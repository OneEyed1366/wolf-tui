import { defineComponent, type PropType } from 'vue'
import { parseErrorToViewState, renderErrorOverview } from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface ErrorOverviewProps {
	/**
	 * The error object to display.
	 */
	error: Error
}
//#endregion Types

//#region Component
/**
 * `<ErrorOverview>` displays an error with its stack trace and code context.
 * It parses the error stack, extracts file locations, and shows surrounding code.
 */
export const ErrorOverview = defineComponent({
	name: 'ErrorOverview',
	props: {
		error: {
			type: Object as PropType<Error>,
			required: true,
		},
	},
	setup(props) {
		return () => {
			const state = parseErrorToViewState(props.error)
			return wNodeToVue(renderErrorOverview(state))
		}
	},
})
//#endregion Component

export type { ErrorOverviewProps as Props, ErrorOverviewProps as IProps }
