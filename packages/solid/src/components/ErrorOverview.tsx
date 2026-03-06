import { type JSX } from 'solid-js'
import { parseErrorToViewState, renderErrorOverview } from '@wolfie/shared'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface IErrorOverviewProps {
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
export function ErrorOverview(props: IErrorOverviewProps): JSX.Element {
	return (() =>
		wNodeToSolid(
			renderErrorOverview(parseErrorToViewState(props.error))
		)) as unknown as JSX.Element
}
//#endregion Component

export type { IErrorOverviewProps as Props, IErrorOverviewProps as IProps }
