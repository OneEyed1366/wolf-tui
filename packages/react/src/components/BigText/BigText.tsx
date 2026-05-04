import {
	renderBigText,
	defaultBigTextTheme,
	type BigTextRenderTheme,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../../theme/theme'
import { wNodeToReact } from '../../wnode/wnode-to-react'
import type { IBigTextProps } from './types'

//#region Component
/**
 * Big ASCII-art text via cfonts (ink-big-text parity). Renders a single
 * wolfie-text node with pre-baked ANSI — do NOT wrap it in styled parents
 * expecting per-segment color, as squashTextNodes will strip nested
 * style.color. Colors/gradient/background are baked into the ANSI bytes.
 */
export function BigText(props: IBigTextProps) {
	const theme = useComponentTheme<BigTextRenderTheme>('BigText')
	const { styles } = theme ?? defaultBigTextTheme

	return wNodeToReact(renderBigText(props, { styles }))
}
//#endregion Component
