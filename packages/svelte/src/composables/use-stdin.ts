import { getContext } from 'svelte'
import { STDIN_CTX } from '../context/symbols.js'
import type { StdinContextValue } from '../context/types.js'

export const useStdin = (): StdinContextValue => {
	const ctx = getContext<StdinContextValue>(STDIN_CTX)
	if (!ctx) {
		throw new Error('useStdin must be used within a WolfieSvelte app')
	}
	return ctx
}
