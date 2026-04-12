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
	TimerComponent,
	injectInput,
} from '@wolf-tui/angular'
import type { TimerVariant } from '@wolf-tui/shared'

//#region TimerDemoComponent
@Component({
	selector: 'app-timer-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent, TimerComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }"
				>Timer Demo</w-text
			>
			<w-text [style]="{ dimColor: true }">
				1=Timer 2=Countdown 3=Stopwatch | Space=toggle R=reset L=lap | Esc=back
			</w-text>
			<w-box [style]="{ marginTop: 1 }">
				<w-timer
					[variant]="variant()"
					[durationMs]="30000"
					format="human"
					[showLaps]="true"
				/>
			</w-box>
			<w-text [style]="{ dimColor: true, marginTop: 1 }">
				Active: {{ variant() }}
			</w-text>
		</w-box>
	`,
})
export class TimerDemoComponent {
	@Output() back = new EventEmitter<void>()

	readonly variant = signal<TimerVariant>('timer')

	constructor() {
		injectInput((input, key) => {
			if (key.escape) this.back.emit()
			if (input === '1') this.variant.set('timer')
			if (input === '2') this.variant.set('countdown')
			if (input === '3') this.variant.set('stopwatch')
		})
	}
}
//#endregion TimerDemoComponent
