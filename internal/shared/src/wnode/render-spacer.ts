import { wbox } from './types'
import type { WNode } from './types'

//#region Render
export function renderSpacer(): WNode {
	return wbox({ style: { flexGrow: 1 } }, [])
}
//#endregion Render
