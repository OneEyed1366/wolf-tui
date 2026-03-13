import { type ReactNode } from 'react'

//#region Types
export type IStatusMessageVariant = 'info' | 'success' | 'error' | 'warning'

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
