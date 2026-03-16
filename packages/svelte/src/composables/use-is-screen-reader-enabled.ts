import { getContext } from 'svelte'
import { ACCESSIBILITY_CTX } from '../context/symbols.js'
import type { AccessibilityContextValue } from '../context/types.js'

export const useIsScreenReaderEnabled = (): boolean => {
	const ctx = getContext<AccessibilityContextValue>(ACCESSIBILITY_CTX)
	return ctx?.isScreenReaderEnabled ?? false
}
