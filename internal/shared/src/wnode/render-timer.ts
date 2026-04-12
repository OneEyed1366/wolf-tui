import figures from 'figures'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'
import type { TimerVariant, ILap } from '../state/timer'

//#region ViewState
export type TimerViewState = {
	formattedTime: string
	isRunning: boolean
	isPaused: boolean
	variant: TimerVariant
	isComplete: boolean
	laps: readonly ILap[]
	prefix?: string
	suffix?: string
}
//#endregion ViewState

//#region Theme
export type TimerRenderTheme = {
	styles: {
		container: () => WNodeProps
		time: (props: {
			isRunning: boolean
			isPaused: boolean
			isComplete: boolean
		}) => WNodeProps
		prefix: () => WNodeProps
		suffix: () => WNodeProps
		lapContainer: () => WNodeProps
		lapItem: (props: { isCurrent: boolean }) => WNodeProps
		lapNumber: () => WNodeProps
		lapTime: () => WNodeProps
		completeIndicator: () => WNodeProps
	}
	config: () => { completeIcon: string; lapIcon: string }
}

export const defaultTimerTheme: TimerRenderTheme = {
	styles: {
		container: (): WNodeProps => ({ style: { flexDirection: 'column' } }),
		time: ({ isRunning, isPaused, isComplete }): WNodeProps => {
			if (isComplete) return { style: { color: 'yellow', fontWeight: 'bold' } }
			if (isPaused) return { style: { dimColor: true } }
			if (isRunning) return { style: { color: 'green' } }
			return {}
		},
		prefix: (): WNodeProps => ({ style: { color: 'gray' } }),
		suffix: (): WNodeProps => ({ style: { color: 'gray' } }),
		lapContainer: (): WNodeProps => ({
			style: { flexDirection: 'column', marginTop: 1 },
		}),
		lapItem: ({ isCurrent }): WNodeProps => ({
			style: { gap: 1, color: isCurrent ? 'cyan' : undefined },
		}),
		lapNumber: (): WNodeProps => ({ style: { dimColor: true } }),
		lapTime: (): WNodeProps => ({ style: {} }),
		completeIndicator: (): WNodeProps => ({
			style: { color: 'yellow', marginLeft: 1 },
		}),
	},
	config: () => ({
		completeIcon: figures.tick,
		lapIcon: figures.pointer,
	}),
}
//#endregion Theme

//#region Helpers
function formatLapDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	const millis = Math.floor((ms % 1000) / 10)

	const mm = String(minutes).padStart(2, '0')
	const ss = String(seconds).padStart(2, '0')
	const cs = String(millis).padStart(2, '0')
	return `${mm}:${ss}.${cs}`
}
//#endregion Helpers

//#region Render
export function renderTimer(
	state: TimerViewState,
	theme: TimerRenderTheme = defaultTimerTheme
): WNode {
	const { styles, config } = theme
	const {
		formattedTime,
		isRunning,
		isPaused,
		isComplete,
		laps,
		prefix,
		suffix,
	} = state

	const timeRowChildren: Array<WNode | string> = []

	if (prefix) {
		timeRowChildren.push(wtext(styles.prefix(), [prefix]))
	}

	timeRowChildren.push(
		wtext(styles.time({ isRunning, isPaused, isComplete }), [formattedTime])
	)

	if (suffix) {
		timeRowChildren.push(wtext(styles.suffix(), [suffix]))
	}

	if (isComplete) {
		const { completeIcon } = config()
		timeRowChildren.push(wtext(styles.completeIndicator(), [completeIcon]))
	}

	const timeRow = wbox({ style: { gap: 1 } }, timeRowChildren)

	const containerChildren: Array<WNode | string> = [timeRow]

	if (laps.length > 0) {
		const { lapIcon } = config()
		const lastLapNumber = laps[laps.length - 1]?.number ?? 0

		const lapNodes = laps.map((lap) => {
			const isCurrent = lap.number === lastLapNumber

			const children: Array<WNode | string> = [
				wtext(styles.lapNumber(), [
					`${isCurrent ? lapIcon : ' '} #${String(lap.number).padStart(2, '0')}`,
				]),
				wtext(styles.lapTime(), [formatLapDuration(lap.durationMs)]),
			]

			return wbox(
				styles.lapItem({ isCurrent }),
				children,
				`lap-${String(lap.number)}`
			)
		})

		containerChildren.push(wbox(styles.lapContainer(), lapNodes))
	}

	return wbox(styles.container(), containerChildren)
}
//#endregion Render
