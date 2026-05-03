import { type JSX, createMemo } from 'solid-js'
import {
	renderTable,
	defaultTableTheme,
	type TableRenderTheme,
	type TableCellValue,
	type TableColumn,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../theme'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

//#region Types
export type ITableRow = Record<string, TableCellValue>

export interface ITableProps<T extends ITableRow = ITableRow> {
	/**
	 * Array of row objects. Each row maps column keys to scalar cell values.
	 */
	data: T[]

	/**
	 * Column definitions in display order. When omitted, columns are derived
	 * from the union of keys across all rows.
	 */
	columns?: Array<keyof T & string> | TableColumn[]

	/**
	 * Horizontal padding inside each cell.
	 *
	 * @default 1
	 */
	padding?: number
}
//#endregion Types

export { defaultTableTheme as tableTheme }

//#region Helpers
function resolveColumns<T extends ITableRow>(
	data: T[],
	columns: ITableProps<T>['columns']
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
export function Table<T extends ITableRow>(props: ITableProps<T>): JSX.Element {
	const theme = useComponentTheme<TableRenderTheme>('Table')
	const resolvedTheme = theme ?? defaultTableTheme

	const wnode = createMemo(() =>
		renderTable(
			{
				columns: resolveColumns(props.data, props.columns),
				rows: props.data,
				padding: props.padding ?? 1,
			},
			resolvedTheme
		)
	)

	return (() => wNodeToSolid(wnode())) as unknown as JSX.Element
}
//#endregion Component

export type { ITableProps as Props, ITableProps as IProps }
