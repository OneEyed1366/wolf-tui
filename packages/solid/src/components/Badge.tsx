import { type JSX, splitProps, createMemo } from 'solid-js'
import type { Styles } from '@wolfie/core'
import {
	renderBadge,
	defaultBadgeTheme,
	type BadgeRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface IBadgeProps {
	children: JSX.Element
	color?: string
	style?: Styles
}
//#endregion Types

export function Badge(props: IBadgeProps): JSX.Element {
	const [local] = splitProps(props, ['children', 'color'])

	const theme = useComponentTheme<BadgeRenderTheme>('Badge')
	const { styles } = theme ?? defaultBadgeTheme

	const wnode = createMemo(() => {
		const label = String(local.children ?? '').toUpperCase()
		return renderBadge(
			{ label, color: local.color as Styles['color'] },
			{ styles }
		)
	})

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
