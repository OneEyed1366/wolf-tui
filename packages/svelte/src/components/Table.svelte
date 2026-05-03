<script lang="ts">
	import {
		renderTable,
		defaultTableTheme,
		type TableRenderTheme,
		type TableCellValue,
		type TableColumn,
	} from '@wolf-tui/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'

	type TableRowData = Record<string, TableCellValue>

	let {
		data,
		columns,
		padding = 1,
	}: {
		data: TableRowData[]
		columns?: string[] | TableColumn[]
		padding?: number
	} = $props()

	const theme = useComponentTheme<TableRenderTheme>('Table')
	const resolvedTheme = theme ?? defaultTableTheme

	function resolveColumns(
		rows: TableRowData[],
		cols: string[] | TableColumn[] | undefined
	): TableColumn[] {
		if (cols && cols.length > 0) {
			return cols.map((col) =>
				typeof col === 'string' ? { key: col } : col
			)
		}
		const seen = new Set<string>()
		const keys: string[] = []
		for (const row of rows) {
			for (const key of Object.keys(row)) {
				if (!seen.has(key)) {
					seen.add(key)
					keys.push(key)
				}
			}
		}
		return keys.map((key) => ({ key }))
	}

	let wnode = $derived(
		renderTable(
			{
				columns: resolveColumns(data, columns),
				rows: data,
				padding,
			},
			resolvedTheme
		)
	)
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
