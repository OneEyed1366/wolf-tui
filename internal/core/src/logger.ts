import { appendFileSync } from 'node:fs'

// #region Types
export type LogCategory =
	| 'dom'
	| 'layout'
	| 'render'
	| 'measure'
	| 'angular'
	| 'vue'
	| 'solid'
	| 'style'
	| 'input'

export type LogEvent = {
	ts: number
	cat: LogCategory | 'meta'
	op: string
	[k: string]: unknown
}
// #endregion Types

// #region Factory
export function createLogger(enabled: boolean, logFile: string) {
	if (!enabled) {
		// WHY: return object with same shape so callers don't need null checks anywhere
		return {
			enabled: false as const,
			log(_event: LogEvent): void {},
			flush(): void {},
		}
	}

	const buffer: string[] = []
	let drainScheduled = false

	// WHY: write header synchronously so the file exists immediately after createLogger()
	// even if no log() calls have fired yet (important for test assertions)
	appendFileSync(
		logFile,
		JSON.stringify({
			ts: performance.now(),
			cat: 'meta',
			op: 'session_start',
			pid: process.pid,
			date: new Date().toISOString(),
		}) + '\n'
	)

	const drain = () => {
		if (!buffer.length) {
			drainScheduled = false
			return
		}
		// WHY: splice to empty the buffer atomically — avoids losing events
		// if log() is called between appendFileSync and the next setImmediate
		appendFileSync(logFile, buffer.splice(0).join(''))
		drainScheduled = false
	}

	const log = (event: LogEvent): void => {
		buffer.push(JSON.stringify(event) + '\n')
		// WHY: schedule only if not already scheduled — coalesces rapid log() calls
		// into a single fs write per event loop turn, same pattern as render-scheduler
		if (!drainScheduled) {
			drainScheduled = true
			setImmediate(drain)
		}
	}

	// WHY: ensure any buffered events are written even if the process exits
	// before setImmediate fires (e.g. Ctrl+C, crash)
	process.on('exit', drain)

	return { enabled: true as const, log, flush: drain }
}
// #endregion Factory

// #region Singleton
// WHY: module-level const allows V8 to dead-code-eliminate all logger.log() calls
// in hot paths after JIT warmup when WOLFIE_LOG is not set
const ENABLED = process.env['WOLFIE_LOG'] === '1'
const LOG_FILE = process.env['WOLFIE_LOG_FILE'] ?? 'wolfie.log'

export const logger = createLogger(ENABLED, LOG_FILE)
// #endregion Singleton
