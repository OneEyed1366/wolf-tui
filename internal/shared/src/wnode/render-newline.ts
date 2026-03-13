import { wtext } from './types'
import type { WNode } from './types'

//#region Render
export function renderNewline(state: { count: number }): WNode {
	return wtext({}, ['\n'.repeat(state.count)])
}
//#endregion Render
