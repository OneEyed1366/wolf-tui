import {
	renderSpinner,
	defaultSpinnerTheme,
	type SpinnerRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../../theme/theme'
import { useSpinner, type UseSpinnerProps } from '../use-spinner'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type ISpinnerProps = UseSpinnerProps & {
	/**
	 * Label to show near the spinner.
	 */
	label?: string
}
//#endregion Types

//#region Component
export function Spinner({ label, type }: ISpinnerProps) {
	const { frame } = useSpinner({ type })
	const theme = useComponentTheme<SpinnerRenderTheme>('Spinner')
	const { styles } = theme ?? defaultSpinnerTheme

	return wNodeToReact(renderSpinner({ frame, label }, { styles }))
}
//#endregion Component
