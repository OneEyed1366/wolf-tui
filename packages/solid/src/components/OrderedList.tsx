import { type JSX, createContext, useContext } from 'solid-js'
import { Box } from './Box'
import { Text } from './Text'

//#region Types
export interface IOrderedListItemProps {
	children: JSX.Element
}

export interface IOrderedListProps {
	children: JSX.Element
}
//#endregion Types

//#region Context
// WHY: local context — counter function shared per list instance, resets per OrderedList render
const OrderedListCtx = createContext<{ getNextIndex: () => number }>({
	getNextIndex: () => 1,
})
//#endregion Context

//#region OrderedListItem Component
export function OrderedListItem(props: IOrderedListItemProps): JSX.Element {
	const ctx = useContext(OrderedListCtx)
	const index = ctx.getNextIndex()

	return (
		<Box style={{ flexDirection: 'row' }}>
			<Text style={{ color: 'green' }}>{index}.</Text>
			<Box style={{ flexDirection: 'column', marginLeft: 1 }}>
				{props.children}
			</Box>
		</Box>
	)
}
//#endregion OrderedListItem Component

//#region OrderedList Component
function OrderedListBase(props: IOrderedListProps): JSX.Element {
	// WHY: mutable counter — resets each render of OrderedList, increments per item
	let counter = 0
	const getNextIndex = () => ++counter

	return (
		<OrderedListCtx.Provider value={{ getNextIndex }}>
			<Box style={{ flexDirection: 'column' }}>{props.children}</Box>
		</OrderedListCtx.Provider>
	)
}

export const OrderedList = /*#__PURE__*/ Object.assign(OrderedListBase, {
	Item: OrderedListItem,
})
//#endregion OrderedList Component

export type { IOrderedListProps as Props, IOrderedListProps as IProps }
