import type { OnChanges } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	signal,
	computed,
} from '@angular/core'
import {
	renderBigText,
	defaultBigTextTheme,
	type BigTextViewState,
	type BigTextFont,
	type BigTextAlign,
	type BigTextBackgroundColor,
	type BigTextGradient,
	type BigTextEnv,
} from '@wolf-tui/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export interface BigTextProps {
	/**
	 * The text to render as a big ASCII font. Required.
	 */
	text: string

	/**
	 * cfonts font face.
	 *
	 * @default "block"
	 */
	font?: BigTextFont

	/**
	 * Horizontal alignment.
	 *
	 * @default "left"
	 */
	align?: BigTextAlign

	/**
	 * Foreground colors (one per character cycling).
	 *
	 * @default ["system"]
	 */
	colors?: readonly string[]

	/**
	 * Background color.
	 *
	 * @default "transparent"
	 */
	backgroundColor?: BigTextBackgroundColor

	/**
	 * Horizontal spacing between glyphs.
	 *
	 * @default 1
	 */
	letterSpacing?: number

	/**
	 * Vertical spacing between glyph rows.
	 *
	 * @default 1
	 */
	lineHeight?: number

	/**
	 * When true, adds empty lines above and below the output.
	 *
	 * @default true
	 */
	space?: boolean

	/**
	 * Maximum characters per line; 0 = unlimited.
	 *
	 * @default 0
	 */
	maxLength?: number

	/**
	 * Gradient spec: either a two-color tuple or a named preset string.
	 */
	gradient?: BigTextGradient

	/**
	 * Recompute the gradient per line instead of across the whole block.
	 *
	 * @default false
	 */
	independentGradient?: boolean

	/**
	 * Treat `gradient` as a direct color-to-color transition instead of an
	 * interpolation palette.
	 *
	 * @default false
	 */
	transitionGradient?: boolean

	/**
	 * cfonts target environment.
	 *
	 * @default "node"
	 */
	env?: BigTextEnv
}
//#endregion Types

//#region BigTextComponent
/**
 * `<w-big-text>` renders a big ASCII-font banner via `cfonts`.
 *
 * Parity with [ink-big-text](https://github.com/sindresorhus/ink-big-text);
 * exposes the full cfonts option surface (gradient, independentGradient,
 * transitionGradient, env) on top of ink-big-text's original props.
 */
@Component({
	selector: 'w-big-text',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BigTextComponent implements OnChanges {
	//#region Inputs
	@Input({ required: true }) text = ''
	@Input() font?: BigTextFont
	@Input() align?: BigTextAlign
	@Input() colors?: readonly string[]
	@Input() backgroundColor?: BigTextBackgroundColor
	@Input() letterSpacing?: number
	@Input() lineHeight?: number
	@Input() space?: boolean
	@Input() maxLength?: number
	@Input() gradient?: BigTextGradient
	@Input() independentGradient?: boolean
	@Input() transitionGradient?: boolean
	@Input() env?: BigTextEnv
	//#endregion Inputs

	//#region Internal State
	// Consolidated view-state signal. Every ngOnChanges rebuilds the object,
	// which invalidates the `wnode` computed (referential inequality). This
	// sidesteps the broken signal `input()` quirk — we stay on @Input + an
	// internal signal that we drive manually.
	private _state = signal<BigTextViewState>({ text: '' })
	//#endregion Internal State

	//#region Computed Properties
	readonly wnode = computed(() =>
		renderBigText(this._state(), defaultBigTextTheme)
	)
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnChanges(): void {
		this._state.set(this.buildViewState())
	}
	//#endregion Lifecycle

	//#region Private Methods
	private buildViewState(): BigTextViewState {
		// Skip undefined fields so `renderBigText`'s own default-merging logic
		// runs (see internal/shared/src/wnode/render-big-text.ts).
		const state: BigTextViewState = { text: this.text }

		if (this.font !== undefined) state.font = this.font
		if (this.align !== undefined) state.align = this.align
		if (this.colors !== undefined) state.colors = this.colors
		if (this.backgroundColor !== undefined)
			state.backgroundColor = this.backgroundColor
		if (this.letterSpacing !== undefined)
			state.letterSpacing = this.letterSpacing
		if (this.lineHeight !== undefined) state.lineHeight = this.lineHeight
		if (this.space !== undefined) state.space = this.space
		if (this.maxLength !== undefined) state.maxLength = this.maxLength
		if (this.gradient !== undefined) state.gradient = this.gradient
		if (this.independentGradient !== undefined)
			state.independentGradient = this.independentGradient
		if (this.transitionGradient !== undefined)
			state.transitionGradient = this.transitionGradient
		if (this.env !== undefined) state.env = this.env

		return state
	}
	//#endregion Private Methods
}
//#endregion BigTextComponent
