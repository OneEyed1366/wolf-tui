import { defineComponent, type PropType, type DefineComponent } from 'vue'
import {
	renderTable,
	defaultTableTheme,
	type TableRenderTheme,
	type TableCellValue,
	type TableColumn,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export type TableRowData = Record<string, TableCellValue>

export interface TableProps {
	/**
	 * Array of row objects. Each row maps column keys to scalar cell values.
	 */
	data: TableRowData[]

	/**
	 * Column definitions in display order. When omitted, columns are derived
	 * from the union of keys across all rows.
	 */
	columns?: string[] | TableColumn[]

	/**
	 * Horizontal padding inside each cell.
	 *
	 * @default 1
	 */
	padding?: number
}
//#endregion Types

export { defaultTableTheme as tableTheme }
export type {
	TableRenderTheme as TableTheme,
	TableColumn,
	TableCellValue,
	TableRowData as TableRow,
}

//#region Helpers
function resolveColumns(
	data: TableRowData[],
	columns: TableProps['columns']
): TableColumn[] {
	if (columns && columns.length > 0) {
		return columns.map((col) => (typeof col === 'string' ? { key: col } : col))
	}
	const seen = new Set<string>()
	const keys: string[] = []
	for (const row of data) {
		for (const key of Object.keys(row)) {
			if (!seen.has(key)) {
				seen.add(key)
				keys.push(key)
			}
		}
	}
	return keys.map((key) => ({ key }))
}
//#endregion Helpers

//#region Component
export const Table: DefineComponent<TableProps> = defineComponent({
	name: 'Table',
	props: {
		data: {
			type: Array as PropType<TableRowData[]>,
			required: true,
		},
		columns: {
			type: Array as PropType<string[] | TableColumn[]>,
			default: undefined,
		},
		padding: {
			type: Number as PropType<number>,
			default: 1,
		},
	},
	setup(props) {
		const theme = useComponentTheme<TableRenderTheme>('Table')
		const resolvedTheme = theme ?? defaultTableTheme

		return () => {
			const resolvedColumns = resolveColumns(props.data, props.columns)
			return wNodeToVue(
				renderTable(
					{
						columns: resolvedColumns,
						rows: props.data,
						padding: props.padding ?? 1,
					},
					resolvedTheme
				)
			)
		}
	},
}) as DefineComponent<TableProps>
//#endregion Component

export type { TableProps as Props, TableProps as IProps }
