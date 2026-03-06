import { createSignal, createMemo, type JSX } from 'solid-js'
import { measureElement } from '@wolfie/core'
import { renderProgressBar, defaultProgressBarTheme } from '@wolfie/shared'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export interface IProgressBarProps {
	/**
	 * Progress value between 0 and 100.
	 *
	 * @default 0
	 */
	value: number
}
//#endregion Types

//#region Component
export function ProgressBar(props: IProgressBarProps): JSX.Element {
	const [width, setWidth] = createSignal(0)

	const wnode = createMemo(() =>
		renderProgressBar(
			{ value: props.value, width: width() },
			defaultProgressBarTheme
		)
	)

	// WHY: wrapper wolfie-box owns ref for measurement; render fn returns bars only
	return (() => (
		<wolfie-box
			ref={(el: any) => {
				if (el) setWidth(measureElement(el).width)
			}}
			style={{ flexGrow: 1, minWidth: 0 }}
		>
			{wNodeToSolid(wnode())}
		</wolfie-box>
	)) as unknown as JSX.Element
}
//#endregion Component

export type { IProgressBarProps as Props, IProgressBarProps as IProps }
