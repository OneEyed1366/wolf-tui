import type { OnInit, OnDestroy, OnChanges } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	signal,
	computed,
	inject,
} from '@angular/core'
import {
	renderTable,
	defaultTableTheme,
	type TableRenderTheme,
	type TableCellValue,
	type TableColumn,
} from '@wolf-tui/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'
import { THEME_CONTEXT, useComponentTheme } from '../../theme'

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

//#region Helpers
function resolveColumns(
	data: TableRowData[],
	columns: string[] | TableColumn[] | undefined
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

//#region TableComponent
/**
 * `<w-table>` displays tabular data with box-drawing borders.
 */
@Component({
	selector: 'w-table',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit, OnDestroy, OnChanges {
	//#region Inputs
	@Input() data: TableRowData[] = []
	@Input() columns?: string[] | TableColumn[]
	@Input() padding = 1
	//#endregion Inputs

	//#region Injected Dependencies
	private globalTheme = inject(THEME_CONTEXT)
	//#endregion Injected Dependencies

	//#region Internal State
	private _data = signal<TableRowData[]>([])
	private _columns = signal<string[] | TableColumn[] | undefined>(undefined)
	private _padding = signal(1)
	//#endregion Internal State

	//#region Computed Properties
	private readonly resolvedTheme = computed(
		() =>
			useComponentTheme<TableRenderTheme>(this.globalTheme, 'Table') ??
			defaultTableTheme
	)

	readonly wnode = computed(() =>
		renderTable(
			{
				columns: resolveColumns(this._data(), this._columns()),
				rows: this._data(),
				padding: this._padding(),
			},
			this.resolvedTheme()
		)
	)
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this.syncInputs()
	}

	ngOnDestroy(): void {}

	ngOnChanges(): void {
		this.syncInputs()
	}
	//#endregion Lifecycle

	//#region Private Methods
	private syncInputs(): void {
		this._data.set(this.data)
		this._columns.set(this.columns)
		this._padding.set(this.padding)
	}
	//#endregion Private Methods
}
//#endregion TableComponent
