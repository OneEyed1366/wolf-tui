import { type JSX, splitProps, createMemo } from 'solid-js'
import {
	renderAlert,
	defaultAlertTheme,
	type AlertRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export type IAlertVariant = 'info' | 'success' | 'error' | 'warning'

export interface IAlertProps {
	children: JSX.Element
	variant: IAlertVariant
	title?: string
}
//#endregion Types

export function Alert(props: IAlertProps): JSX.Element {
	const [local] = splitProps(props, ['children', 'variant', 'title'])

	const theme = useComponentTheme<AlertRenderTheme>('Alert')
	const { styles, config } = theme ?? defaultAlertTheme

	// createMemo tracks reactive reads (local.variant, local.children) so the
	// WNode tree recomputes when props change.
	const wnode = createMemo(() =>
		renderAlert(
			{
				variant: local.variant,
				title: local.title,
				message: String(local.children ?? ''),
			},
			{ styles, config }
		)
	)

	// WHY: solid-js JSX.Element type = Node | ... (excludes () => JSX.Element in
	// this version). The function return IS valid at Solid runtime — insert() treats
	// () => Element as a reactive FunctionElement. Cast is safe.
	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
