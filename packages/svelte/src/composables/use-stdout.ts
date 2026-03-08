import { getContext } from 'svelte'
import { STDOUT_KEY } from '../context/keys'
import type { StdoutContextValue } from '../context/types'

/** Must be called during component initialization */
export function useStdout(): StdoutContextValue {
	return getContext<StdoutContextValue>(STDOUT_KEY)
}
