import { getContext } from 'svelte'
import { STDOUT_CTX } from '../context/symbols.js'
import type { StdoutContextValue } from '../context/types.js'

export const useStdout = (): StdoutContextValue => {
	const ctx = getContext<StdoutContextValue>(STDOUT_CTX)
	if (!ctx) {
		throw new Error('useStdout must be used within a WolfieSvelte app')
	}
	return ctx
}
