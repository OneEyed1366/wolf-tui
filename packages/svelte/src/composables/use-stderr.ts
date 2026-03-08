import { getContext } from 'svelte'
import { STDERR_KEY } from '../context/keys'
import type { StderrContextValue } from '../context/types'

/** Must be called during component initialization */
export function useStderr(): StderrContextValue {
	return getContext<StderrContextValue>(STDERR_KEY)
}
