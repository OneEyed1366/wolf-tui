import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'

//#region Types
export type TableCellValue = string | number | boolean | null | undefined

export type TableRow = Record<string, TableCellValue>

export type TableColumn = {
	key: string
	header?: string
}

export type TableViewState = {
	columns: TableColumn[]
	rows: TableRow[]
	padding: number
}
//#endregion Types

//#region Theme
export type TableBorderChars = {
	topLeft: string
	topRight: string
	bottomLeft: string
	bottomRight: string
	horizontal: string
	vertical: string
	tDown: string
	tUp: string
	tLeft: string
	tRight: string
	cross: string
}

export type TableRenderTheme = {
	styles: {
		container: () => WNodeProps
		row: () => WNodeProps
		border: () => WNodeProps
		headerCell: (props: { columnKey: string }) => WNodeProps
		cell: (props: { columnKey: string; rowIndex: number }) => WNodeProps
	}
	config: () => {
		borderChars: TableBorderChars
	}
}

export const defaultTableTheme: TableRenderTheme = {
	styles: {
		container: (): WNodeProps => ({ style: { flexDirection: 'column' } }),
		row: (): WNodeProps => ({ style: { flexDirection: 'row' } }),
		border: (): WNodeProps => ({ style: { color: 'gray' } }),
		headerCell: (): WNodeProps => ({
			style: { color: 'blue', fontWeight: 'bold' },
		}),
		cell: (): WNodeProps => ({ style: {} }),
	},
	config: () => ({
		borderChars: {
			topLeft: '\u250C',
			topRight: '\u2510',
			bottomLeft: '\u2514',
			bottomRight: '\u2518',
			horizontal: '\u2500',
			vertical: '\u2502',
			tDown: '\u252C',
			tUp: '\u2534',
			tLeft: '\u2524',
			tRight: '\u251C',
			cross: '\u253C',
		},
	}),
}
//#endregion Theme

//#region Helpers
function stringifyCell(value: TableCellValue): string {
	if (value === null || value === undefined) return ''
	return String(value)
}

function padCell(text: string, width: number, padding: number): string {
	const pad = ' '.repeat(padding)
	const gap = ' '.repeat(Math.max(0, width - text.length))
	return `${pad}${text}${gap}${pad}`
}

function buildHorizontalLine(
	widths: number[],
	padding: number,
	left: string,
	mid: string,
	right: string,
	horizontal: string
): string {
	const segments = widths.map((w) => horizontal.repeat(w + padding * 2))
	return `${left}${segments.join(mid)}${right}`
}

function computeWidths(state: TableViewState): number[] {
	const { columns, rows } = state
	return columns.map((col) => {
		const headerText = col.header ?? col.key
		let max = headerText.length
		for (const row of rows) {
			const cellText = stringifyCell(row[col.key])
			if (cellText.length > max) max = cellText.length
		}
		return max
	})
}
//#endregion Helpers

//#region Render
export function renderTable(
	state: TableViewState,
	theme: TableRenderTheme = defaultTableTheme
): WNode {
	const { columns, rows, padding } = state
	const { styles, config: configFn } = theme
	const { borderChars } = configFn()

	const widths = computeWidths(state)

	const children: Array<WNode | string> = []

	children.push(
		wtext(styles.border(), [
			buildHorizontalLine(
				widths,
				padding,
				borderChars.topLeft,
				borderChars.tDown,
				borderChars.topRight,
				borderChars.horizontal
			),
		])
	)

	const headerChildren: Array<WNode | string> = []
	headerChildren.push(wtext(styles.border(), [borderChars.vertical]))
	columns.forEach((col, i) => {
		const headerText = col.header ?? col.key
		headerChildren.push(
			wtext(styles.headerCell({ columnKey: col.key }), [
				padCell(headerText, widths[i] ?? 0, padding),
			])
		)
		headerChildren.push(wtext(styles.border(), [borderChars.vertical]))
	})
	children.push(wbox(styles.row(), headerChildren))

	children.push(
		wtext(styles.border(), [
			buildHorizontalLine(
				widths,
				padding,
				borderChars.tRight,
				borderChars.cross,
				borderChars.tLeft,
				borderChars.horizontal
			),
		])
	)

	rows.forEach((row, rowIndex) => {
		const rowChildren: Array<WNode | string> = []
		rowChildren.push(wtext(styles.border(), [borderChars.vertical]))
		columns.forEach((col, i) => {
			const cellText = stringifyCell(row[col.key])
			rowChildren.push(
				wtext(styles.cell({ columnKey: col.key, rowIndex }), [
					padCell(cellText, widths[i] ?? 0, padding),
				])
			)
			rowChildren.push(wtext(styles.border(), [borderChars.vertical]))
		})
		children.push(wbox(styles.row(), rowChildren, `row-${rowIndex}`))
	})

	children.push(
		wtext(styles.border(), [
			buildHorizontalLine(
				widths,
				padding,
				borderChars.bottomLeft,
				borderChars.tUp,
				borderChars.bottomRight,
				borderChars.horizontal
			),
		])
	)

	return wbox(styles.container(), children)
}
//#endregion Render
