import {
	Component,
	ChangeDetectionStrategy,
	Output,
	EventEmitter,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	JsonViewerComponent,
	injectInput,
} from '@wolf-tui/angular'

//#region Data
const sampleData = {
	name: 'wolf-tui',
	version: '1.4.0',
	frameworks: ['react', 'vue', 'angular', 'solid', 'svelte'],
	community: {
		timer: { variants: ['timer', 'countdown', 'stopwatch'] },
		treeView: { selectionModes: ['none', 'single', 'multiple'] },
		combobox: { fuzzyMatch: true, async: false },
		jsonViewer: { types: 16, virtualScroll: true },
		filePicker: { multiSelect: true, symlinks: true },
	},
	stats: {
		components: 25,
		adapters: 5,
		tests: 1113,
		nullExample: null,
		boolExample: true,
		nested: {
			deep: {
				value: 42,
				array: [1, 2, 3],
			},
		},
	},
}
//#endregion Data

//#region JsonViewerDemoComponent
@Component({
	selector: 'app-json-viewer-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent, JsonViewerComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }"
				>JsonViewer Demo</w-text
			>
			<w-text [style]="{ dimColor: true }">
				Up/Down=navigate Right/Left=expand/collapse e=expand-all E=collapse-all
				g/G=first/last Esc=back
			</w-text>
			<w-box [style]="{ marginTop: 1 }">
				<w-json-viewer
					[data]="sampleData"
					[defaultExpandDepth]="2"
					[visibleNodeCount]="16"
				/>
			</w-box>
		</w-box>
	`,
})
export class JsonViewerDemoComponent {
	@Output() back = new EventEmitter<void>()

	readonly sampleData = sampleData

	constructor() {
		injectInput((_input, key) => {
			if (key.escape) this.back.emit()
		})
	}
}
//#endregion JsonViewerDemoComponent
