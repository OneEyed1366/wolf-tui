import { getContext } from 'svelte'
import { STDERR_CTX } from '../context/symbols.js'
import type { StderrContextValue } from '../context/types.js'

export const useStderr = (): StderrContextValue => {
	const ctx = getContext<StderrContextValue>(STDERR_CTX)
	if (!ctx) {
		throw new Error('useStderr must be used within a WolfieSvelte app')
	}
	return ctx
}
