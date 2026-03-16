import { appendFileSync } from 'node:fs'

//#region Constants
const DEBUG = process.env['DEBUG']
const LOG_FILE = 'debug.log'
//#endregion Constants

//#region Debug Logger
export function debugLog(message: string): void {
	if (!DEBUG) return
	const timestamp = new Date().toISOString().slice(11, 23) // HH:mm:ss.SSS
	appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`)
}

export function debugTime<T>(label: string, fn: () => T): T {
	if (!DEBUG) return fn()
	const start = performance.now()
	const result = fn()
	const elapsed = (performance.now() - start).toFixed(2)
	if (parseFloat(elapsed) > 5) {
		// Only log slow operations (>5ms)
		debugLog(`SLOW ${label}: ${elapsed}ms`)
	}
	return result
}

// Initialize log file on module load
if (DEBUG) {
	appendFileSync(
		LOG_FILE,
		`\n=== Game started at ${new Date().toISOString()} ===\n`
	)
}
//#endregion Debug Logger
