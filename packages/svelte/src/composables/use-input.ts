import { onDestroy } from 'svelte'
import { parseInputData, type IKey } from '@wolfie/shared'
import { useStdin } from './use-stdin.js'

//#region Types
export type Key = IKey

export type Handler = (input: string, key: Key) => void

export type Options = {
	isActive?: () => boolean
}
//#endregion Types

//#region Composable
export const useInput = (inputHandler: Handler, options: Options = {}) => {
	const { setRawMode, internal_exitOnCtrlC, internal_eventEmitter } = useStdin()

	// Enable raw mode on init if active
	if (options.isActive?.() !== false) {
		setRawMode(true)
	}

	const handleData = (data: string) => {
		if (options.isActive?.() === false) return

		const { input, key } = parseInputData(data)

		if (!(input === 'c' && key.ctrl) || !internal_exitOnCtrlC) {
			inputHandler(input, key)
		}
	}

	internal_eventEmitter.on('input', handleData)

	onDestroy(() => {
		internal_eventEmitter.off('input', handleData)
		if (options.isActive?.() !== false) {
			setRawMode(false)
		}
	})
}
//#endregion Composable
