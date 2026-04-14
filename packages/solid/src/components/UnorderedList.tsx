import { type JSX, createContext, useContext } from 'solid-js'
import figures from 'figures'
import { Box } from './Box'
import { Text } from './Text'

//#region Types
export interface IUnorderedListItemProps {
	children: JSX.Element
}

export interface IUnorderedListProps {
	children: JSX.Element
}
//#endregion Types

//#region Context
// WHY: local contexts — no need to export to symbols.ts, scoped to this component tree
const UnorderedListCtx = /*#__PURE__*/ createContext<{ depth: number }>({
	depth: 0,
})
const UnorderedListItemCtx = /*#__PURE__*/ createContext<{ marker: string }>({
	marker: '',
})
//#endregion Context

//#region UnorderedListItem Component
export function UnorderedListItem(props: IUnorderedListItemProps): JSX.Element {
	const listItemCtx = useContext(UnorderedListItemCtx)

	return (
		<Box style={{ flexDirection: 'row' }}>
			<Text style={{ color: 'green' }}>{listItemCtx.marker}</Text>
			<Box style={{ flexDirection: 'column', marginLeft: 1 }}>
				{props.children}
			</Box>
		</Box>
	)
}
//#endregion UnorderedListItem Component

//#region UnorderedList Component
function UnorderedListBase(props: IUnorderedListProps): JSX.Element {
	const listCtx = useContext(UnorderedListCtx)
	const depth = listCtx.depth

	const markers = [figures.bullet, figures.line, figures.pointer]
	const marker = markers[depth % markers.length] ?? figures.bullet

	return (
		<UnorderedListCtx.Provider value={{ depth: depth + 1 }}>
			<UnorderedListItemCtx.Provider value={{ marker }}>
				<Box style={{ flexDirection: 'column' }}>{props.children}</Box>
			</UnorderedListItemCtx.Provider>
		</UnorderedListCtx.Provider>
	)
}

export const UnorderedList = /*#__PURE__*/ Object.assign(UnorderedListBase, {
	Item: UnorderedListItem,
})
//#endregion UnorderedList Component

export type { IUnorderedListProps as Props, IUnorderedListProps as IProps }
