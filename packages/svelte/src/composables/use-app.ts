import { getContext } from 'svelte'
import { APP_KEY } from '../context/keys'
import type { AppContextValue } from '../context/types'

/** Must be called during component initialization */
export function useApp(): AppContextValue {
	return getContext<AppContextValue>(APP_KEY)
}
