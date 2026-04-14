import { createContext } from 'react'
import figures from 'figures'

export type OrderedListItemContextProps = {
	/**
	 * Marker that's displayed before each list item.
	 */
	marker: string
}

export const OrderedListItemContext =
	/*#__PURE__*/ createContext<OrderedListItemContextProps>({
		marker: figures.line,
	})
