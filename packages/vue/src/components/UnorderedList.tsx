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
import {
	UnorderedListSymbol,
	UnorderedListItemSymbol,
} from '../context/symbols'
import { flatten } from '../utils/slots'
import { OrderedList } from './OrderedList'

//#region Types
export type UnorderedListContextProps = {
	/**
	 * Depth of the list.
	 */
	depth: number
}

export type UnorderedListItemContextProps = {
	/**
	 * Marker that's displayed before each list item.
	 */
	marker: string
}

export type UnorderedListTheme = {
	styles: {
		list: () => Partial<BoxProps>
		listItem: () => Partial<BoxProps>
		marker: () => Partial<TextProps>
		content: () => Partial<BoxProps>
	}
	config: () => {
		marker: string | string[]
	}
}

export interface UnorderedListProps {
	/**
	 * List items.
	 */
	children?: VNode[]
}

export interface UnorderedListItemProps {
	/**
	 * List item content.
	 */
	children?: VNode[]
}
//#endregion Types

//#region Constants
const defaultMarker = figures.line
const defaultMarkers = [figures.bullet, figures.line, figures.pointer]
//#endregion Constants

//#region Theme
export const unorderedListTheme = {
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
	config() {
		return {
			marker: defaultMarkers,
		}
	},
} satisfies IComponentTheme
//#endregion Theme

//#region UnorderedListItem Component
export const UnorderedListItem = defineComponent({
	name: 'UnorderedListItem',
	props: {
		children: {
			type: Array as PropType<VNode[]>,
			default: undefined,
		},
	},
	setup(props, { slots }) {
		const itemContext = inject<UnorderedListItemContextProps>(
			UnorderedListItemSymbol,
			{ marker: defaultMarker }
		)

		return () => {
			const theme = useComponentTheme<UnorderedListTheme>('UnorderedList')
			const styles = theme?.styles ?? unorderedListTheme.styles

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
//#endregion UnorderedListItem Component

//#region UnorderedList Component
const UnorderedListComponent = defineComponent({
	name: 'UnorderedList',
	props: {
		children: {
			type: Array as PropType<VNode[]>,
			default: undefined,
		},
	},
	setup(props, { slots }) {
		const parentContext = inject<UnorderedListContextProps>(
			UnorderedListSymbol,
			{ depth: 0 }
		)

		// Compute contexts and provide them in setup
		const theme = useComponentTheme<UnorderedListTheme>('UnorderedList')
		const config = theme?.config ?? unorderedListTheme.config

		// Determine marker based on depth
		const { marker: markerConfig } = config()
		let marker: string

		if (typeof markerConfig === 'string') {
			marker = markerConfig
		} else if (Array.isArray(markerConfig)) {
			marker =
				markerConfig[parentContext.depth] ??
				markerConfig.at(-1) ??
				defaultMarker
		} else {
			marker = defaultMarker
		}

		// Provide contexts for nested lists and items
		const listContext: UnorderedListContextProps = {
			depth: parentContext.depth + 1,
		}
		const itemContext: UnorderedListItemContextProps = { marker }

		provide<UnorderedListContextProps>(UnorderedListSymbol, listContext)
		provide<UnorderedListItemContextProps>(UnorderedListItemSymbol, itemContext)

		return () => {
			const styles = theme?.styles ?? unorderedListTheme.styles
			const children = slots.default?.() ?? props.children ?? []
			const flatChildren = flatten(
				Array.isArray(children) ? children : [children]
			)

			const wrappedChildren = flatChildren.map((child) => {
				if (
					child &&
					typeof child === 'object' &&
					'type' in child &&
					(child.type === UnorderedListItem ||
						(child.type as any)?.name === 'UnorderedListItem' ||
						child.type === UnorderedListComponent ||
						(child.type as any)?.name === 'UnorderedList' ||
						child.type === OrderedList ||
						(child.type as any)?.name === 'OrderedList')
				) {
					return child
				}

				return h(UnorderedListItem, null, () => child)
			})

			const result = <Box {...styles.list()}>{wrappedChildren}</Box>
			return result
		}
	},
})

export const UnorderedList = /*#__PURE__*/ Object.assign(
	UnorderedListComponent,
	{
		Item: UnorderedListItem,
	}
)
//#endregion UnorderedList Component

export type { UnorderedListProps as Props, UnorderedListProps as IProps }
