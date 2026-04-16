import type { OnInit, OnDestroy, OnChanges } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	signal,
	computed,
} from '@angular/core'
import type { GradientName } from '@wolf-tui/shared'
import { renderGradient, defaultGradientTheme } from '@wolf-tui/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

//#region Types
export interface GradientProps {
	/**
	 * Text to render with the gradient.
	 */
	text?: string

	/**
	 * Preset gradient name.
	 */
	name?: GradientName

	/**
	 * Custom gradient colors (overrides `name` if provided).
	 */
	colors?: string[]
}
//#endregion Types

//#region GradientComponent
/**
 * `<w-gradient>` renders text colored with a gradient (preset or custom).
 */
@Component({
	selector: 'w-gradient',
	standalone: true,
	imports: [WNodeOutletComponent],
	template: `<w-wnode-outlet [node]="wnode()" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradientComponent implements OnInit, OnDestroy, OnChanges {
	//#region Inputs
	@Input() text = ''
	@Input() name?: GradientName
	@Input() colors?: string[]
	//#endregion Inputs

	//#region Internal State
	private _text = signal<string>('')
	private _name = signal<GradientName | undefined>(undefined)
	private _colors = signal<string[] | undefined>(undefined)
	//#endregion Internal State

	//#region Computed Properties
	readonly wnode = computed(() =>
		renderGradient(
			{
				text: this._text(),
				name: this._name(),
				colors: this._colors(),
			},
			defaultGradientTheme
		)
	)
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._text.set(this.text)
		this._name.set(this.name)
		this._colors.set(this.colors)
	}

	ngOnDestroy(): void {}

	ngOnChanges(): void {
		this._text.set(this.text)
		this._name.set(this.name)
		this._colors.set(this.colors)
	}
	//#endregion Lifecycle
}
//#endregion GradientComponent
