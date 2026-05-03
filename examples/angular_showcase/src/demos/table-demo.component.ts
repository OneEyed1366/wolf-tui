import {
	Component,
	ChangeDetectionStrategy,
	Output,
	EventEmitter,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	TableComponent,
	injectInput,
} from '@wolf-tui/angular'

//#region Data
const data = [
	{ id: 1, name: 'Naruto', role: 'Hokage', level: 100 },
	{ id: 2, name: 'Sasuke', role: 'Jonin', level: 95 },
	{ id: 3, name: 'Sakura', role: 'Medic', level: 88 },
	{ id: 4, name: 'Kakashi', role: 'Jonin', level: 99 },
]
//#endregion Data

//#region TableDemoComponent
@Component({
	selector: 'app-table-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent, TableComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }"
				>Table Demo</w-text
			>
			<w-text [style]="{ dimColor: true }">Esc=back</w-text>
			<w-box [style]="{ marginTop: 1 }">
				<w-table [data]="data" />
			</w-box>
		</w-box>
	`,
})
export class TableDemoComponent {
	@Output() back = new EventEmitter<void>()

	readonly data = data

	constructor() {
		injectInput((_input, key) => {
			if (key.escape) this.back.emit()
		})
	}
}
//#endregion TableDemoComponent
