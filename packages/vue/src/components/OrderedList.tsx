import {
	defineComponent,
	inject,
	provide,
	h,
	type PropType,
	type VNode,
} from 'vue'
import figures from 'figures'
import { Box, type BoxProps } from './Box'
import { Text, type TextProps } from './Text'
import { useComponentTheme, type IComponentTheme } from '../theme'
import { OrderedListSymbol, OrderedListItemSymbol } from '../context/symbols'
import { flatten } from '../utils/slots'
import { UnorderedList } from './UnorderedList'

//#region Types
export type OrderedListContextProps = {
	/**
	 * Marker from the parent list.
	 */
	marker: string
}

export type OrderedListItemContextProps = {
	/**
	 * Marker that's displayed before each list item.
	 */
	marker: string
}

export type OrderedListTheme = {
	styles: {
		list: () => Partial<BoxProps>
		listItem: () => Partial<BoxProps>
		marker: () => Partial<TextProps>
		content: () => Partial<BoxProps>
	}
}

export interface OrderedListProps {
	/**
	 * List items.
	 */
	children?: VNode[]
}

export interface OrderedListItemProps {
	/**
	 * List item content.
	 */
	children?: VNode[]
}
//#endregion Types

//#region Theme
export const orderedListTheme = {
	styles: {
		list: (): Partial<BoxProps> => ({
			style: {
				flexDirection: 'column',
			},
		}),
		listItem: (): Partial<BoxProps> => ({
			style: {
				flexDirection: 'row',
			},
		}),
		marker: (): Partial<TextProps> => ({
			style: {
				color: 'green',
			},
		}),
		content: (): Partial<BoxProps> => ({
			style: {
				flexDirection: 'column',
				marginLeft: 1,
			},
		}),
	},
} satisfies IComponentTheme
//#endregion Theme

//#region Internal Wrapper Component
const OrderedListItemWrapper = defineComponent({
	name: 'OrderedListItemWrapper',
	props: {
		marker: {
			type: String,
			required: true,
		},
	},
	setup(props, { slots }) {
		provide<OrderedListContextProps>(OrderedListSymbol, {
			marker: props.marker,
		})
		provide<OrderedListItemContextProps>(OrderedListItemSymbol, {
			marker: props.marker,
		})

		return () => slots.default?.()
	},
})
//#endregion Internal Wrapper Component

//#region OrderedListItem Component
export const OrderedListItem = defineComponent({
	name: 'OrderedListItem',
	props: {
		children: {
			type: Array as PropType<VNode[]>,
			default: undefined,
		},
	},
	setup(props, { slots }) {
		const itemContext = inject<OrderedListItemContextProps>(
			OrderedListItemSymbol,
			{ marker: figures.line }
		)

		return () => {
			const theme = useComponentTheme<OrderedListTheme>('OrderedList')
			const styles = theme?.styles ?? orderedListTheme.styles

			const children = slots.default?.() ?? props.children

			return (
				<Box {...styles.listItem()}>
					<Text {...styles.marker()}>{itemContext.marker}</Text>
					<Box {...styles.content()}>{children}</Box>
				</Box>
			)
		}
	},
})
//#endregion OrderedListItem Component

//#region OrderedList Component
const OrderedListComponent = defineComponent({
	name: 'OrderedList',
	props: {
		children: {
			type: Array as PropType<VNode[]>,
			default: undefined,
		},
	},
	setup(props, { slots }) {
		const parentContext = inject<OrderedListContextProps>(OrderedListSymbol, {
			marker: '',
		})

		return () => {
			const theme = useComponentTheme<OrderedListTheme>('OrderedList')
			const styles = theme?.styles ?? orderedListTheme.styles

			const children = slots.default?.() ?? props.children ?? []
			const flatChildren = flatten(
				Array.isArray(children) ? children : [children]
			)

			// Count OrderedListItem children (or children that will be wrapped)
			let numberOfItems = 0
			for (const child of flatChildren) {
				if (
					child &&
					typeof child === 'object' &&
					'type' in child &&
					(child.type === OrderedListComponent ||
						(child.type as any)?.name === 'OrderedList' ||
						child.type === UnorderedList ||
						(child.type as any)?.name === 'UnorderedList')
				) {
					// Don't count nested lists as items for the current list's numbering
					continue
				}
				numberOfItems++
			}

			const maxMarkerWidth = String(numberOfItems).length

			let itemIndex = 0

			const wrappedChildren = flatChildren.map((child) => {
				if (
					child &&
					typeof child === 'object' &&
					'type' in child &&
					(child.type === OrderedListComponent ||
						(child.type as any)?.name === 'OrderedList' ||
						child.type === UnorderedList ||
						(child.type as any)?.name === 'UnorderedList')
				) {
					return child
				}

				if (
					child &&
					typeof child === 'object' &&
					'type' in child &&
					(child.type === OrderedListItem ||
						(child.type as any)?.name === 'OrderedListItem')
				) {
					itemIndex++
					const paddedMarker = `${String(itemIndex).padStart(maxMarkerWidth)}.`
					const marker = `${parentContext.marker}${paddedMarker}`

					return h(
						OrderedListItemWrapper,
						{ marker, key: itemIndex },
						() => child
					)
				}

				itemIndex++
				const paddedMarker = `${String(itemIndex).padStart(maxMarkerWidth)}.`
				const marker = `${parentContext.marker}${paddedMarker}`

				return h(OrderedListItemWrapper, { marker, key: itemIndex }, () =>
					h(OrderedListItem, null, () => child)
				)
			})

			const result = <Box {...styles.list()}>{wrappedChildren}</Box>
			return result
		}
	},
})

export const OrderedList = /*#__PURE__*/ Object.assign(OrderedListComponent, {
	Item: OrderedListItem,
})
//#endregion OrderedList Component

export type { OrderedListProps as Props, OrderedListProps as IProps }
