import { getContext } from 'svelte'
import { FOCUS_CTX } from '../context/symbols.js'
import type { FocusContextValue } from '../context/types.js'

//#region Types
export interface FocusManagerContext {
	enableFocus: () => void
	disableFocus: () => void
	focusNext: () => void
	focusPrevious: () => void
	focus: (id: string) => void
}
//#endregion Types

//#region Composable
export const useFocusManager = (): FocusManagerContext => {
	const focusContext = getContext<FocusContextValue>(FOCUS_CTX)

	return {
		enableFocus: () => focusContext?.enableFocus(),
		disableFocus: () => focusContext?.disableFocus(),
		focusNext: () => focusContext?.focusNext(),
		focusPrevious: () => focusContext?.focusPrevious(),
		focus: (id: string) => focusContext?.focus(id),
	}
}
//#endregion Composable
