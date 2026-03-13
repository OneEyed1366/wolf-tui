import { type ReactNode } from 'react'
import {
	renderStatusMessage,
	defaultStatusMessageTheme,
	type StatusMessageRenderTheme,
	type StatusMessageVariant,
} from '@wolfie/shared'
import { useComponentTheme } from '../../theme/theme'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type IStatusMessageVariant = StatusMessageVariant

export type IStatusMessageProps = {
	/**
	 * Message.
	 */
	children: ReactNode

	/**
	 * Variant, which determines the color used in the status message.
	 */
	variant: IStatusMessageVariant
}
//#endregion Types

//#region Component
export function StatusMessage({ children, variant }: IStatusMessageProps) {
	const theme = useComponentTheme<StatusMessageRenderTheme>('StatusMessage')
	const { styles, config } = theme ?? defaultStatusMessageTheme

	const message = String(children ?? '')

	return wNodeToReact(
		renderStatusMessage({ variant, message }, { styles, config })
	)
}
//#endregion Component
