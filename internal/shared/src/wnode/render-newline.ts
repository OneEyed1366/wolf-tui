import { wtext } from './types'
import type { WNode } from './types'

//#region ViewState
export type NewlineViewState = {
	/** Number of newline characters to insert. Defaults to 1. */
	count: number
}
//#endregion ViewState

//#region Render
export function renderNewline(state: NewlineViewState = { count: 1 }): WNode {
	return wtext({}, ['\n'.repeat(state.count)])
}
//#endregion Render
