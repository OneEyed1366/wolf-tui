import { type Styles } from '@wolfie/core'
import { type ReactNode } from 'react'

//#region Types
export type IBadgeProps = {
	/**
	 * Label.
	 */
	children: ReactNode

	/**
	 * Color.
	 *
	 * @default "magenta"
	 */
	color?: Styles['color']
}
//#endregion Types
