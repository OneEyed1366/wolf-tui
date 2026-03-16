import { getContext } from 'svelte'
import { APP_CTX } from '../context/symbols.js'
import type { AppContextValue } from '../context/types.js'

export const useApp = (): AppContextValue => {
	const ctx = getContext<AppContextValue>(APP_CTX)
	if (!ctx) {
		throw new Error('useApp must be used within a WolfieSvelte app')
	}
	return ctx
}
