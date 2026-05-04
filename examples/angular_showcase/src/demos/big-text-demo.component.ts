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
	BigTextComponent,
	injectInput,
	type BigTextFont,
} from '@wolf-tui/angular'

//#region Types
type ColorMode = 'solo' | 'gradient' | 'default'
//#endregion Types

//#region Constants
// cfonts fonts, in the order the spec asks for. Index drives key mapping.
const FONTS: ReadonlyArray<BigTextFont> = [
	'block',
	'slick',
	'tiny',
	'grid',
	'pallet',
	'shade',
	'simple',
	'simpleBlock',
	'3d',
	'simple3d',
	'chrome',
	'huge',
]

// Digit/symbol -> font index. 1-9 -> 0-8, 0 -> 9, '-' -> 10, '=' -> 11.
const KEY_TO_FONT_INDEX: Readonly<Record<string, number>> = {
	'1': 0,
	'2': 1,
	'3': 2,
	'4': 3,
	'5': 4,
	'6': 5,
	'7': 6,
	'8': 7,
	'9': 8,
	'0': 9,
	'-': 10,
	'=': 11,
}

// Solo colors cycle through a fixed palette in the order fonts advance.
const SOLO_COLORS: ReadonlyArray<string> = [
	'cyan',
	'magenta',
	'yellow',
	'green',
	'red',
	'blue',
	'white',
]

// Named cfonts gradient preset.
const GRADIENT_PRESET: ReadonlyArray<string> = ['#ff8800', '#ff0080']

const COLOR_MODE_CYCLE: ReadonlyArray<ColorMode> = [
	'solo',
	'gradient',
	'default',
]
//#endregion Constants

//#region BigTextDemoComponent
@Component({
	selector: 'app-big-text-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent, BigTextComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }"
				>BigText Demo</w-text
			>
			<w-text [style]="{ dimColor: true }">
				BigText Demo — 1-9/0/-/= switch font, C cycle color mode, Esc back
			</w-text>
			<w-text [style]="{ marginTop: 1, color: 'green' }">
				Font: {{ currentFont() }}
			</w-text>
			<w-text [style]="{ color: 'yellow' }">
				Color mode: {{ colorMode() }}
			</w-text>
			<w-box [style]="{ marginTop: 1 }">
				@if (colorMode() === 'gradient') {
					<w-big-text
						text="WOLF"
						[font]="currentFont()"
						[gradient]="gradientColors"
						[space]="false"
						align="center"
					/>
				} @else {
					<w-big-text
						text="WOLF"
						[font]="currentFont()"
						[colors]="currentColors()"
						[space]="false"
						align="center"
					/>
				}
			</w-box>
		</w-box>
	`,
})
export class BigTextDemoComponent {
	@Output() back = new EventEmitter<void>()

	readonly gradientColors = GRADIENT_PRESET

	readonly fontIndex = signal(0)
	readonly colorMode = signal<ColorMode>('solo')

	readonly currentFont = computed<BigTextFont>(
		() => FONTS[this.fontIndex()] ?? 'block'
	)

	// In default mode cfonts uses its own palette — pass ['system'] to opt in.
	// In solo mode we cycle a single color tied to the current font index.
	readonly currentColors = computed<readonly string[]>(() => {
		if (this.colorMode() === 'default') return ['system']
		const color = SOLO_COLORS[this.fontIndex() % SOLO_COLORS.length] ?? 'cyan'
		return [color]
	})

	constructor() {
		injectInput((input, key) => {
			if (key.escape) {
				this.back.emit()
				return
			}
			if (input === 'c' || input === 'C') {
				this.colorMode.update((mode) => {
					const next = COLOR_MODE_CYCLE.indexOf(mode) + 1
					return COLOR_MODE_CYCLE[next % COLOR_MODE_CYCLE.length] ?? 'solo'
				})
				return
			}
			const mapped = KEY_TO_FONT_INDEX[input]
			if (mapped !== undefined && mapped < FONTS.length) {
				this.fontIndex.set(mapped)
			}
		})
	}
}
//#endregion BigTextDemoComponent
