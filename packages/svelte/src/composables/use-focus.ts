import { onDestroy, getContext } from 'svelte'
import { FOCUS_CTX } from '../context/symbols.js'
import type { FocusContextValue } from '../context/types.js'

//#region Types
export interface FocusOptions {
	isActive?: () => boolean
	autoFocus?: boolean
	id?: string
}
//#endregion Types

const generateId = () => Math.random().toString(36).slice(2, 11)

//#region Composable
export const useFocus = (options: FocusOptions = {}) => {
	const focusContext = getContext<FocusContextValue>(FOCUS_CTX)

	const id = options.id ?? generateId()
	const autoFocus = options.autoFocus ?? false

	const isFocused = () => {
		if (!focusContext) return false
		return focusContext.activeFocusId() === id
	}

	// Register immediately (same pattern as Solid — onMount doesn't fire reliably)
	focusContext?.add(id, { autoFocus })

	onDestroy(() => {
		focusContext?.remove(id)
	})

	const focus = (targetId: string) => {
		focusContext?.focus(targetId)
	}

	return {
		isFocused,
		focus,
		id,
	}
}
//#endregion Composable
