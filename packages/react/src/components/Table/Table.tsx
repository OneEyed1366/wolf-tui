import {
	renderTable,
	defaultTableTheme,
	type TableRenderTheme,
	type TableCellValue,
	type TableColumn,
} from '@wolf-tui/shared'
import { useComponentTheme } from '../../theme/theme'
import { wNodeToReact } from '../../wnode/wnode-to-react'

//#region Types
export type ITableRow = Record<string, TableCellValue>

export type ITableProps<T extends ITableRow = ITableRow> = {
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
export function Table<T extends ITableRow>({
	data,
	columns,
	padding = 1,
}: ITableProps<T>) {
	const theme = useComponentTheme<TableRenderTheme>('Table')
	const resolvedTheme = theme ?? defaultTableTheme

	const resolvedColumns = resolveColumns(data, columns)

	return wNodeToReact(
		renderTable(
			{ columns: resolvedColumns, rows: data, padding },
			resolvedTheme
		)
	)
}
//#endregion Component
