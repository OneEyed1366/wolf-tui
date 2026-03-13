import { type JSX, createSignal } from 'solid-js'
import { renderProgressBar, defaultProgressBarTheme } from '@wolfie/shared'
import { measureElement } from '@wolfie/core'
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

export { defaultProgressBarTheme as progressBarTheme }

//#region Component
export function ProgressBar(props: IProgressBarProps): JSX.Element {
	const [width, setWidth] = createSignal(0)

	const refCallback = (el: any) => {
		if (el) setWidth(measureElement(el).width)
	}

	return (() => {
		const wnode = renderProgressBar(
			{ value: props.value, width: width() },
			defaultProgressBarTheme
		)
		return (
			<wolfie-box ref={refCallback} {...(wnode.props as any)}>
				{wnode.children.map((child) =>
					typeof child === 'string' ? child : wNodeToSolid(child)
				)}
			</wolfie-box>
		)
	}) as unknown as JSX.Element
}
//#endregion Component

export type { IProgressBarProps as Props, IProgressBarProps as IProps }
