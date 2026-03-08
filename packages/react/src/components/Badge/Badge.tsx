import { type Styles } from '@wolfie/core'
import { type ReactNode } from 'react'
import {
	renderBadge,
	defaultBadgeTheme,
	type BadgeRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../../theme/theme'
import { wNodeToReact } from '../../wnode/wnode-to-react'

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

//#region Component
export function Badge({ children, color = 'magenta' }: IBadgeProps) {
	const theme = useComponentTheme<BadgeRenderTheme>('Badge')
	const { styles } = theme ?? defaultBadgeTheme

	// Extract string label — Badge displays plain text, not arbitrary nodes.
	const label =
		typeof children === 'string'
			? children.toUpperCase()
			: String(children ?? '')

	return wNodeToReact(renderBadge({ label, color }, { styles }))
}
//#endregion Component
