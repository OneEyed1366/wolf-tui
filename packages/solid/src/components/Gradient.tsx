import { type JSX, splitProps, createMemo } from 'solid-js'
import {
	renderGradient,
	defaultGradientTheme,
	type GradientRenderTheme,
	type GradientName,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface IGradientProps {
	children: JSX.Element
	name?: GradientName
	colors?: string[]
}
//#endregion Types

export function Gradient(props: IGradientProps): JSX.Element {
	const [local] = splitProps(props, ['children', 'name', 'colors'])

	const theme = useComponentTheme<GradientRenderTheme>('Gradient')

	const wnode = createMemo(() => {
		const text = String(local.children ?? '')
		return renderGradient(
			{ text, name: local.name, colors: local.colors },
			theme ?? defaultGradientTheme
		)
	})

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
