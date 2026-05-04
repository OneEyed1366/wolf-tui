import { inject } from 'vue'
import { AccessibilitySymbol } from '../context/symbols'

interface AccessibilityContext {
	isScreenReaderEnabled: boolean
}

export const useIsScreenReaderEnabled = (): boolean => {
	const ctx = inject<AccessibilityContext>(AccessibilitySymbol)
	return ctx?.isScreenReaderEnabled ?? false
}
