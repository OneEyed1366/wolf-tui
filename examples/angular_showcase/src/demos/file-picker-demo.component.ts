import {
	Component,
	ChangeDetectionStrategy,
	Output,
	EventEmitter,
	signal,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	FilePickerComponent,
	injectInput,
} from '@wolf-tui/angular'

//#region FilePickerDemoComponent
@Component({
	selector: 'app-file-picker-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent, FilePickerComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }"
				>FilePicker Demo</w-text
			>
			<w-text [style]="{ dimColor: true }">
				Up/Down=navigate Space=toggle Enter=confirm Left=parent Right=enter dir
				/=filter Esc=back
			</w-text>
			<w-box [style]="{ marginTop: 1 }">
				<w-file-picker
					[initialPath]="initialPath"
					[showDetails]="true"
					[multiSelect]="true"
					[maxHeight]="12"
					(selectionChange)="onSelectionChange($event)"
					(select)="onSelect($event)"
				/>
			</w-box>
			@if (selectedPaths().length > 0) {
				<w-box [style]="{ flexDirection: 'column', marginTop: 1 }">
					<w-text [style]="{ color: 'yellow' }">
						Toggled ({{ selectedPaths().length }}):
					</w-text>
					@for (p of selectedPaths(); track p) {
						<w-text [style]="{ dimColor: true }"> {{ p }}</w-text>
					}
				</w-box>
			}
			@if (confirmedPaths().length > 0) {
				<w-box [style]="{ flexDirection: 'column', marginTop: 1 }">
					<w-text [style]="{ color: 'green' }">
						Confirmed ({{ confirmedPaths().length }}):
					</w-text>
					@for (p of confirmedPaths(); track p) {
						<w-text [style]="{ dimColor: true }"> {{ p }}</w-text>
					}
				</w-box>
			}
		</w-box>
	`,
})
export class FilePickerDemoComponent {
	@Output() back = new EventEmitter<void>()

	readonly initialPath = process.cwd()
	readonly selectedPaths = signal<string[]>([])
	readonly confirmedPaths = signal<string[]>([])

	constructor() {
		injectInput((_input, key) => {
			if (key.escape && this.confirmedPaths().length === 0) this.back.emit()
		})
	}

	onSelectionChange(paths: string[]): void {
		this.selectedPaths.set(paths)
	}

	onSelect(paths: string[]): void {
		this.confirmedPaths.set(paths)
	}
}
//#endregion FilePickerDemoComponent
