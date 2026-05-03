import {
	Component,
	ChangeDetectionStrategy,
	Output,
	EventEmitter,
	signal,
	computed,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	GradientComponent,
	injectInput,
} from '@wolf-tui/angular'
import type { GradientName } from '@wolf-tui/shared'

//#region Constants
const PRESETS: ReadonlyArray<GradientName> = [
	'rainbow',
	'atlas',
	'cristal',
	'teen',
	'mind',
	'morning',
	'vice',
	'passion',
	'fruit',
	'instagram',
	'retro',
	'summer',
	'pastel',
]

const SAMPLE_TEXT = 'wolf-tui gradient demo'
const CUSTOM_COLORS: ReadonlyArray<string> = ['#ff3366', '#ffd700']
//#endregion Constants

//#region GradientDemoComponent
@Component({
	selector: 'app-gradient-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent, GradientComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }"
				>Gradient Demo</w-text
			>
			<w-text [style]="{ dimColor: true }">
				← → = cycle presets | Esc = back
			</w-text>

			<w-box [style]="{ flexDirection: 'column', marginTop: 1 }">
				<w-text [style]="{ dimColor: true }">Preset: {{ current() }}</w-text>
				<w-gradient [text]="sampleText" [name]="current()" />
			</w-box>

			<w-box [style]="{ flexDirection: 'column', marginTop: 1 }">
				<w-text [style]="{ dimColor: true }"
					>Custom colors (red → gold):</w-text
				>
				<w-gradient text="Hand-picked stops" [colors]="customColors" />
			</w-box>

			<w-box [style]="{ flexDirection: 'column', marginTop: 1 }">
				<w-text [style]="{ dimColor: true }">All presets at a glance:</w-text>
				@for (name of presets; track name) {
					<w-gradient [text]="formatRow(name)" [name]="name" />
				}
			</w-box>
		</w-box>
	`,
})
export class GradientDemoComponent {
	@Output() back = new EventEmitter<void>()

	readonly presets = PRESETS
	readonly sampleText = SAMPLE_TEXT
	readonly customColors = [...CUSTOM_COLORS]

	private readonly presetIndex = signal(0)
	readonly current = computed<GradientName>(() => {
		const preset = PRESETS[this.presetIndex() % PRESETS.length]
		return preset ?? 'rainbow'
	})

	constructor() {
		injectInput((_input, key) => {
			if (key.escape) {
				this.back.emit()
				return
			}
			if (key.rightArrow) {
				this.presetIndex.update((i) => (i + 1) % PRESETS.length)
			}
			if (key.leftArrow) {
				this.presetIndex.update(
					(i) => (i - 1 + PRESETS.length) % PRESETS.length
				)
			}
		})
	}

	formatRow(name: GradientName): string {
		return `${name.padEnd(10, ' ')}  ${SAMPLE_TEXT}`
	}
}
//#endregion GradientDemoComponent
