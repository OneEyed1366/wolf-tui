import { useState } from 'react'
import {
	renderProgressBar,
	defaultProgressBarTheme,
	type ProgressBarRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../../theme/theme'
import { wNodeToReact } from '../../wnode/wnode-to-react'
import { measureElement, type DOMElement } from '@wolfie/core'

//#region Types
export type IProgressBarProps = {
	/**
	 * Progress.
	 * Must be between 0 and 100.
	 *
	 * @default 0
	 */
	value: number
}
//#endregion Types

// Re-export for theme registry backward-compatibility
export { defaultProgressBarTheme as progressBarTheme }

//#region Component
export function ProgressBar({ value }: IProgressBarProps) {
	const [width, setWidth] = useState(0)
	const [ref, setRef] = useState<DOMElement | null>(null)

	if (ref) {
		const dimensions = measureElement(ref)
		if (dimensions.width !== width) {
			setWidth(dimensions.width)
		}
	}

	const theme =
		useComponentTheme<ProgressBarRenderTheme>('ProgressBar') ??
		defaultProgressBarTheme

	const wnode = renderProgressBar({ value, width }, theme)

	// Unpack root WNode manually to attach ref — cloneElement ref typing requires
	// known element shape, so native wolfie-box JSX is safer here.
	const children = wnode.children.map((child, i) =>
		typeof child === 'string' ? child : wNodeToReact(child, i)
	)

	return (
		<wolfie-box ref={setRef} {...(wnode.props as any)}>
			{children}
		</wolfie-box>
	)
}
//#endregion Component
