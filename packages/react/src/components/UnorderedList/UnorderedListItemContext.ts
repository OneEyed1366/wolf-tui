import { createContext } from 'react'
import { defaultMarker } from './constants'

export type IUnorderedListItemContextProps = {
	/**
	 * Marker that's displayed before each list item.
	 */
	marker: string
}

export const UnorderedListItemContext =
	/*#__PURE__*/ createContext<IUnorderedListItemContextProps>({
		marker: defaultMarker,
	})
