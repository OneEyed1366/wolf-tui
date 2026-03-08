import { getContext, onDestroy } from 'svelte'
import { get } from 'svelte/store'
import { FOCUS_KEY } from '../context/keys'
import type { FocusContextValue } from '../context/types'

export interface UseFocusOptions {
	id: string
	autoFocus?: boolean
}

export interface UseFocusResult {
	isFocused: () => boolean
}

/** Must be called during component initialization */
export function useFocus(options: UseFocusOptions): UseFocusResult {
	const focus = getContext<FocusContextValue>(FOCUS_KEY)

	focus.add(options.id, { autoFocus: options.autoFocus ?? false })
	onDestroy(() => focus.remove(options.id))

	return {
		// WHY: get() reads store value synchronously — called at render time
		// when Svelte evaluates the component's reactive expressions
		isFocused: () => get(focus.activeFocusId) === options.id,
	}
}
