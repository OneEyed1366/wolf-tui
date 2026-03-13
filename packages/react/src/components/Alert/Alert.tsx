import {
	renderAlert,
	defaultAlertTheme,
	type AlertRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../../theme/theme'
import { wNodeToReact } from '../../wnode/wnode-to-react'
import type { IAlertProps } from './types'

//#region Component
export function Alert({ children, variant, title }: IAlertProps) {
	const theme = useComponentTheme<AlertRenderTheme>('Alert')
	const { styles, config } = theme ?? defaultAlertTheme

	const message = String(children ?? '')

	return wNodeToReact(
		renderAlert({ variant, title, message }, { styles, config })
	)
}
//#endregion Component
