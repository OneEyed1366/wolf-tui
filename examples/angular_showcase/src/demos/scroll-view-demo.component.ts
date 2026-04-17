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
	ScrollViewComponent,
	injectInput,
} from '@wolf-tui/angular'

//#region Data
const ITEMS: ReadonlyArray<string> = Array.from(
	{ length: 30 },
	(_, i) => `Item ${String(i + 1).padStart(2, '0')}`
)
const VIEWPORT_HEIGHT = 8
//#endregion Data

//#region ScrollViewDemoComponent
@Component({
	selector: 'app-scroll-view-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent, ScrollViewComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }"
				>ScrollView Demo</w-text
			>
			<w-text [style]="{ dimColor: true }">
				↑↓=scroll PgUp/PgDn=page Home/End=edges Esc=back
			</w-text>

			<w-box
				[style]="{
					marginTop: 1,
					flexDirection: 'column',
					borderStyle: 'round',
					borderColor: 'gray',
				}"
			>
				<w-scroll-view
					[height]="viewportHeight"
					(onScroll)="offset.set($event)"
					(onContentHeightChange)="contentHeight.set($event)"
				>
					@for (item of items; track item) {
						<w-text>{{ item }}</w-text>
					}
				</w-scroll-view>
			</w-box>

			<w-text [style]="{ dimColor: true, marginTop: 1 }">
				offset={{ offset() }} contentHeight={{ contentHeight() }} viewport={{
					viewportHeight
				}}
			</w-text>
		</w-box>
	`,
})
export class ScrollViewDemoComponent {
	@Output() back = new EventEmitter<void>()

	readonly items = ITEMS
	readonly viewportHeight = VIEWPORT_HEIGHT
	readonly offset = signal(0)
	readonly contentHeight = signal(0)

	constructor() {
		injectInput((_input, key) => {
			if (key.escape) this.back.emit()
		})
	}
}
//#endregion ScrollViewDemoComponent
