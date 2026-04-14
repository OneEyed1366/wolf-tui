import { createContext } from 'react'

export type IUnorderedListContextProps = {
	/**
	 * Depth of the list.
	 */
	depth: number
}

export const UnorderedListContext =
	/*#__PURE__*/ createContext<IUnorderedListContextProps>({
		depth: 0,
	})
