import { type ReactNode } from 'react'
import {
	renderGradient,
	defaultGradientTheme,
	type GradientRenderTheme,
	type GradientName,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../../theme/theme'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type IGradientProps = {
	/**
	 * Text to paint with the gradient.
	 */
	children: ReactNode

	/**
	 * Named gradient preset.
	 *
	 * @default "rainbow"
	 */
	name?: GradientName

	/**
	 * Custom gradient stops (overrides `name` when provided).
	 */
	colors?: string[]
}
//#endregion Types

//#region Component
export function Gradient({ children, name, colors }: IGradientProps) {
	const theme = useComponentTheme<GradientRenderTheme>('Gradient')
	const { styles } = theme ?? defaultGradientTheme

	// Extract string text — Gradient paints plain text, not arbitrary nodes.
	const text = typeof children === 'string' ? children : String(children ?? '')

	return wNodeToReact(renderGradient({ text, name, colors }, { styles }))
}
//#endregion Component
