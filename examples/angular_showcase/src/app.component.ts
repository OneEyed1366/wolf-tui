import { Component, ChangeDetectionStrategy, signal } from '@angular/core'
import { BoxComponent, TextComponent, injectInput } from '@wolf-tui/angular'
import { TimerDemoComponent } from './demos/timer-demo.component'
import { TreeViewDemoComponent } from './demos/tree-view-demo.component'
import { ComboboxDemoComponent } from './demos/combobox-demo.component'
import { JsonViewerDemoComponent } from './demos/json-viewer-demo.component'
import { FilePickerDemoComponent } from './demos/file-picker-demo.component'
import { BigTextDemoComponent } from './demos/big-text-demo.component'
import { TableDemoComponent } from './demos/table-demo.component'
import { ScrollViewDemoComponent } from './demos/scroll-view-demo.component'
import { GradientDemoComponent } from './demos/gradient-demo.component'

//#region Types
type DemoName =
	| 'timer'
	| 'treeview'
	| 'combobox'
	| 'jsonviewer'
	| 'filepicker'
	| 'bigtext'
	| 'table'
	| 'scrollview'
	| 'gradient'

interface IDemoEntry {
	key: DemoName
	label: string
}
//#endregion Types

//#region Constants
const DEMOS: ReadonlyArray<IDemoEntry> = [
	{ key: 'timer', label: 'Timer / Countdown / Stopwatch' },
	{ key: 'treeview', label: 'TreeView' },
	{ key: 'combobox', label: 'Combobox (Autocomplete)' },
	{ key: 'jsonviewer', label: 'JsonViewer' },
	{ key: 'filepicker', label: 'FilePicker' },
	{ key: 'bigtext', label: 'BigText (cfonts banner)' },
	{ key: 'table', label: 'Table' },
	{ key: 'scrollview', label: 'ScrollView' },
	{ key: 'gradient', label: 'Gradient (ink-gradient port)' },
]
//#endregion Constants

//#region AppComponent
@Component({
	selector: 'app-root',
	standalone: true,
	imports: [
		BoxComponent,
		TextComponent,
		TimerDemoComponent,
		TreeViewDemoComponent,
		ComboboxDemoComponent,
		JsonViewerDemoComponent,
		FilePickerDemoComponent,
		BigTextDemoComponent,
		TableDemoComponent,
		ScrollViewDemoComponent,
		GradientDemoComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		@switch (activeDemo()) {
			@case ('timer') {
				<app-timer-demo (back)="goBack()" />
			}
			@case ('treeview') {
				<app-tree-view-demo (back)="goBack()" />
			}
			@case ('combobox') {
				<app-combobox-demo (back)="goBack()" />
			}
			@case ('jsonviewer') {
				<app-json-viewer-demo (back)="goBack()" />
			}
			@case ('filepicker') {
				<app-file-picker-demo (back)="goBack()" />
			}
			@case ('bigtext') {
				<app-big-text-demo (back)="goBack()" />
			}
			@case ('table') {
				<app-table-demo (back)="goBack()" />
			}
			@case ('scrollview') {
				<app-scroll-view-demo (back)="goBack()" />
			}
			@case ('gradient') {
				<app-gradient-demo (back)="goBack()" />
			}
			@default {
				<w-box [style]="{ flexDirection: 'column', padding: 1 }">
					<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }">
						wolf-tui Community Components Showcase
					</w-text>
					<w-text [style]="{ dimColor: true }">
						Use arrow-keys to navigate, Enter to select, Ctrl+C to exit
					</w-text>
					<w-box [style]="{ flexDirection: 'column', marginTop: 1 }">
						@for (demo of demos; track demo.key; let i = $index) {
							<w-text [style]="{ color: i === focused() ? 'blue' : undefined }">
								{{ i === focused() ? '> ' : '  ' }}{{ demo.label }}
							</w-text>
						}
					</w-box>
				</w-box>
			}
		}
	`,
})
export class AppComponent {
	readonly demos = DEMOS
	readonly focused = signal(0)
	readonly activeDemo = signal<DemoName | null>(null)

	constructor() {
		injectInput((_input, key) => {
			if (this.activeDemo() !== null) return

			if (key.downArrow) {
				this.focused.update((f) => Math.min(f + 1, DEMOS.length - 1))
			}
			if (key.upArrow) {
				this.focused.update((f) => Math.max(f - 1, 0))
			}
			if (key.return) {
				const demo = DEMOS[this.focused()]
				if (demo) {
					this.activeDemo.set(demo.key)
				}
			}
		})
	}

	goBack(): void {
		this.activeDemo.set(null)
	}
}
//#endregion AppComponent
