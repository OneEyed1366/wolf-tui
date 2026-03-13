import { renderSpacer } from '@wolfie/shared'
import { wNodeToReact } from '../../wnode/wnode-to-react'

/**
A flexible space that expands along the major axis of its containing layout.

It's useful as a shortcut for filling all the available space between elements.
*/
export function Spacer() {
	return wNodeToReact(renderSpacer())
}
