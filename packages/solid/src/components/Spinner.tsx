import { type JSX, createSignal, createMemo, onCleanup } from 'solid-js'
import {
	renderSpinner,
	defaultSpinnerTheme,
	type SpinnerRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface ISpinnerProps {
	label?: string
}
//#endregion Types

// WHY: inlined to avoid adding cli-spinners dep; these are the standard dots3 frames
const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export function Spinner(props: ISpinnerProps): JSX.Element {
	const [frameIdx, setFrameIdx] = createSignal(0)

	// WHY: clearInterval on cleanup prevents timer from firing after unmount
	const timer = setInterval(
		() => setFrameIdx((i) => (i + 1) % FRAMES.length),
		80
	)
	onCleanup(() => clearInterval(timer))

	const theme = useComponentTheme<SpinnerRenderTheme>('Spinner')
	const { styles } = theme ?? defaultSpinnerTheme

	// createMemo tracks frameIdx() signal — recomputes every 80ms
	const wnode = createMemo(() =>
		renderSpinner(
			{ frame: FRAMES[frameIdx()]!, label: props.label },
			{ styles }
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
