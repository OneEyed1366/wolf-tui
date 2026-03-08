import { onDestroy } from 'svelte'
import { parseInputData, type IKey } from '@wolfie/shared'
import { useStdin } from './use-stdin'

export interface UseInputOptions {
	/** Return false to disable this handler (e.g. when a screen is inactive) */
	isActive?: () => boolean
}

/** Must be called during component initialization */
export function useInput(
	handler: (input: string, key: IKey) => void,
	options: UseInputOptions = {}
): void {
	const stdin = useStdin()

	// WHY: Only enter raw mode when handler is active — raw mode swallows
	// Ctrl+C (SIGINT), so we want it off when the screen is inactive
	if (options.isActive?.() !== false) {
		stdin.setRawMode(true)
		onDestroy(() => stdin.setRawMode(false))
	}

	const handleData = (data: string) => {
		if (options.isActive?.() === false) return
		const { input, key } = parseInputData(data)
		// WHY: exitOnCtrlC=true means WolfieSvelte handles Ctrl+C as process.exit —
		// skip user handler so both don't fire
		if (input === 'c' && key.ctrl && stdin.internal_exitOnCtrlC) return
		handler(input, key)
	}

	stdin.internal_eventEmitter.on('input', handleData)
	onDestroy(() => stdin.internal_eventEmitter.off('input', handleData))
}
