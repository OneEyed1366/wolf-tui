import React, { type ReactNode, useContext, isValidElement } from 'react'
import { Box } from '../Box'
import { useComponentTheme } from '../../theme/theme'
import { OrderedListItem } from './OrderedListItem'
import { OrderedListContext } from './OrderedListContext'
import { OrderedListItemContext } from './OrderedListItemContext'
import type { OrderedListTheme } from './theme'

export type OrderedListProps = {
	/**
	 * List items.
	 */
	children: ReactNode
}

function OrderedListComponent({ children }: OrderedListProps) {
	const { marker: parentMarker } = useContext(OrderedListContext)
	const { styles } = useComponentTheme<OrderedListTheme>('OrderedList')

	let numberOfItems = 0

	for (const child of React.Children.toArray(children)) {
		if (!isValidElement(child) || child.type !== OrderedListItem) {
			continue
		}

		numberOfItems++
	}

	const maxMarkerWidth = String(numberOfItems).length

	return (
		<Box {...styles.list()}>
			{React.Children.map(children, (child, index) => {
				if (!isValidElement(child) || child.type !== OrderedListItem) {
					return child
				}

				const paddedMarker = `${String(index + 1).padStart(maxMarkerWidth)}.`
				const marker = `${parentMarker}${paddedMarker}`

				return (
					<OrderedListContext.Provider value={{ marker }}>
						<OrderedListItemContext.Provider value={{ marker }}>
							{child}
						</OrderedListItemContext.Provider>
					</OrderedListContext.Provider>
				)
			})}
		</Box>
	)
}

export const OrderedList = /*#__PURE__*/ Object.assign(OrderedListComponent, {
	Item: OrderedListItem,
})
