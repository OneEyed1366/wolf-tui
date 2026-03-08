import { getContext } from 'svelte'
import { STDIN_KEY } from '../context/keys'
import type { StdinContextValue } from '../context/types'

/** Must be called during component initialization */
export function useStdin(): StdinContextValue {
	return getContext<StdinContextValue>(STDIN_KEY)
}
