import { wbox } from './types'
import type { WNode } from './types'

//#region Render
/** Renders a flex spacer that expands to fill remaining space in its parent. */
export function renderSpacer(): WNode {
	return wbox({ style: { flexGrow: 1 } }, [])
}
//#endregion Render
