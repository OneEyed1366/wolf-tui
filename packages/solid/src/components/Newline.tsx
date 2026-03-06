import { type JSX } from 'solid-js'
import { renderNewline } from '@wolfie/shared'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface NewlineProps {
	count?: number
}
//#endregion Types

export function Newline(props: NewlineProps): JSX.Element {
	return (() =>
		wNodeToSolid(
			renderNewline({ count: props.count ?? 1 })
		)) as unknown as JSX.Element
}

export type { NewlineProps as Props, NewlineProps as IProps }
