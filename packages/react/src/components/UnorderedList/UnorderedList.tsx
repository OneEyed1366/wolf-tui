import { useMemo, type ReactNode, useContext } from 'react'
import { Box } from '../Box'
import { useComponentTheme } from '../../theme/theme'
import { UnorderedListItem } from './UnorderedListItem'
import { UnorderedListContext } from './UnorderedListContext'
import { UnorderedListItemContext } from './UnorderedListItemContext'
import type { IUnorderedListTheme } from './theme'
import { defaultMarker } from './constants'

export type IUnorderedListProps = {
	/**
	 * List items.
	 */
	children: ReactNode
}

function UnorderedListComponent({ children }: IUnorderedListProps) {
	const { depth } = useContext(UnorderedListContext)
	const { styles, config } =
		useComponentTheme<IUnorderedListTheme>('UnorderedList')

	const listContext = useMemo(
		() => ({
			depth: depth + 1,
		}),
		[depth]
	)

	const listItemContext = useMemo(() => {
		const { marker } = config()

		if (typeof marker === 'string') {
			return { marker }
		}

		if (Array.isArray(marker)) {
			return {
				marker: marker[depth] ?? marker.at(-1) ?? defaultMarker,
			}
		}

		return {
			marker: defaultMarker,
		}
	}, [config, depth])

	return (
		<UnorderedListContext.Provider value={listContext}>
			<UnorderedListItemContext.Provider value={listItemContext}>
				<Box {...styles.list()}>{children}</Box>
			</UnorderedListItemContext.Provider>
		</UnorderedListContext.Provider>
	)
}

export const UnorderedList = /*#__PURE__*/ Object.assign(
	UnorderedListComponent,
	{
		Item: UnorderedListItem,
	}
)
