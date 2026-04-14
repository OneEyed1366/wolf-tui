//#region Types
export type IFormattedTime = {
	text: string
	hours: number
	minutes: number
	seconds: number
	milliseconds: number
	totalMs: number
}

export type TimeFormatPreset = 'digital' | 'digital-ms' | 'human' | 'human-ms'
export type TimeFormatFn = (ms: number) => string
export type TimeFormat = TimeFormatPreset | TimeFormatFn
//#endregion Types

//#region Decompose
export function decomposeMs(
	totalMs: number
): Omit<IFormattedTime, 'text'> & { totalMs: number } {
	const ms = Math.max(0, totalMs)
	const hours = Math.floor(ms / 3_600_000)
	const minutes = Math.floor((ms % 3_600_000) / 60_000)
	const seconds = Math.floor((ms % 60_000) / 1_000)
	const milliseconds = ms % 1_000

	return { hours, minutes, seconds, milliseconds, totalMs: ms }
}
//#endregion Decompose

//#region Formatters
function pad2(n: number): string {
	return n < 10 ? `0${n}` : `${n}`
}

function pad3(n: number): string {
	if (n < 10) return `00${n}`
	if (n < 100) return `0${n}`
	return `${n}`
}

function formatDigital(totalMs: number): string {
	const { hours, minutes, seconds } = decomposeMs(totalMs)
	return hours > 0
		? `${hours}:${pad2(minutes)}:${pad2(seconds)}`
		: `${pad2(minutes)}:${pad2(seconds)}`
}

function formatDigitalMs(totalMs: number): string {
	const { hours, minutes, seconds, milliseconds } = decomposeMs(totalMs)
	return hours > 0
		? `${hours}:${pad2(minutes)}:${pad2(seconds)}.${pad3(milliseconds)}`
		: `${pad2(minutes)}:${pad2(seconds)}.${pad3(milliseconds)}`
}

function formatHuman(totalMs: number): string {
	const { hours, minutes, seconds } = decomposeMs(totalMs)
	const parts: string[] = []
	if (hours > 0) parts.push(`${hours}h`)
	if (minutes > 0 || hours > 0) parts.push(`${minutes}m`)
	parts.push(`${seconds}s`)
	return parts.join(' ')
}

function formatHumanMs(totalMs: number): string {
	const { hours, minutes, seconds, milliseconds } = decomposeMs(totalMs)
	const parts: string[] = []
	if (hours > 0) parts.push(`${hours}h`)
	if (minutes > 0 || hours > 0) parts.push(`${minutes}m`)
	parts.push(`${seconds}s`)
	parts.push(`${milliseconds}ms`)
	return parts.join(' ')
}

const presetMap: Record<TimeFormatPreset, (ms: number) => string> = {
	digital: formatDigital,
	'digital-ms': formatDigitalMs,
	human: formatHuman,
	'human-ms': formatHumanMs,
}
//#endregion Formatters

//#region API
export function formatTime(
	totalMs: number,
	format: TimeFormat = 'digital'
): IFormattedTime {
	const decomposed = decomposeMs(totalMs)

	let text: string
	if (typeof format === 'function') {
		try {
			text = format(totalMs)
		} catch {
			text = formatDigital(totalMs)
		}
	} else {
		text = presetMap[format](totalMs)
	}

	return {
		...decomposed,
		text,
	}
}
//#endregion API
