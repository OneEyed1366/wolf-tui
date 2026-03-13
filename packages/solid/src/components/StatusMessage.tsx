import { type JSX, splitProps, createMemo } from 'solid-js'
import {
	renderStatusMessage,
	defaultStatusMessageTheme,
	type StatusMessageRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export type IStatusMessageVariant = 'info' | 'success' | 'error' | 'warning'

export interface IStatusMessageProps {
	children: JSX.Element
	variant: IStatusMessageVariant
}
//#endregion Types

export function StatusMessage(props: IStatusMessageProps): JSX.Element {
	const [local] = splitProps(props, ['children', 'variant'])

	const theme = useComponentTheme<StatusMessageRenderTheme>('StatusMessage')
	const { styles, config } = theme ?? defaultStatusMessageTheme

	const wnode = createMemo(() =>
		renderStatusMessage(
			{ variant: local.variant, message: String(local.children ?? '') },
			{ styles, config }
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
