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
	ComboboxComponent,
	injectInput,
} from '@wolf-tui/angular'
import type { Option } from '@wolf-tui/shared'

//#region Data
const languages: Option[] = [
	{ label: 'TypeScript', value: 'ts' },
	{ label: 'JavaScript', value: 'js' },
	{ label: 'Python', value: 'py' },
	{ label: 'Rust', value: 'rs' },
	{ label: 'Go', value: 'go' },
	{ label: 'Ruby', value: 'rb' },
	{ label: 'Java', value: 'java' },
	{ label: 'C++', value: 'cpp' },
	{ label: 'C#', value: 'cs' },
	{ label: 'Kotlin', value: 'kt' },
	{ label: 'Swift', value: 'swift' },
	{ label: 'PHP', value: 'php' },
	{ label: 'Elixir', value: 'ex' },
	{ label: 'Haskell', value: 'hs' },
	{ label: 'Scala', value: 'scala' },
]
//#endregion Data

//#region ComboboxDemoComponent
@Component({
	selector: 'app-combobox-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent, ComboboxComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }"
				>Combobox Demo</w-text
			>
			<w-text [style]="{ dimColor: true }">
				Type to filter, Up/Down=navigate, Enter=select, Tab=autofill, Esc×2=back
			</w-text>
			<w-box [style]="{ marginTop: 1 }">
				<w-combobox
					[options]="languages"
					placeholder="Search languages..."
					[visibleOptionCount]="8"
					(select)="onSelect($event)"
				/>
			</w-box>
			@if (selected()) {
				<w-text [style]="{ color: 'green', marginTop: 1 }">
					Selected: {{ selected() }}
				</w-text>
			}
		</w-box>
	`,
})
export class ComboboxDemoComponent {
	@Output() back = new EventEmitter<void>()

	readonly languages = languages
	readonly selected = signal<string | undefined>(undefined)
	private lastEscapeMs = 0

	constructor() {
		injectInput((_input, key) => {
			if (key.escape) {
				const now = Date.now()
				if (now - this.lastEscapeMs < 500) {
					this.back.emit()
				}
				this.lastEscapeMs = now
			}
		})
	}

	onSelect(value: string): void {
		this.selected.set(value)
	}
}
//#endregion ComboboxDemoComponent
