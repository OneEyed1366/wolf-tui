import { Component, signal, computed, inject } from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	injectInput,
	AppService,
} from '@wolf-tui/angular'

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box
			[style]="{
				flexDirection: 'column',
				borderStyle: 'round',
				borderColor: 'cyan',
				paddingLeft: 2,
				paddingRight: 2,
				paddingTop: 1,
				paddingBottom: 1,
				gap: 1,
				width: 40,
			}"
		>
			<w-box [style]="{ justifyContent: 'center' }">
				<w-text [style]="{ fontWeight: 'bold', color: 'cyan' }">
					wolf-tui
				</w-text>
			</w-box>

			<w-box
				[style]="{
					justifyContent: 'center',
					borderStyle: 'single',
					borderColor: color(),
					paddingLeft: 2,
					paddingRight: 2,
				}"
			>
				<w-text [style]="{ fontWeight: 'bold', color: color() }">
					{{ count() }}
				</w-text>
			</w-box>

			<w-box [style]="{ justifyContent: 'space-around' }">
				<w-text [style]="{ color: 'green' }">↑ up</w-text>
				<w-text [style]="{ color: 'red' }">↓ down</w-text>
				<w-text [style]="{ color: 'gray' }">q quit</w-text>
			</w-box>
		</w-box>
	`,
})
export class AppComponent {
	count = signal(0)
	color = computed(() =>
		this.count() > 0 ? 'green' : this.count() < 0 ? 'red' : 'white'
	)
	private app = inject(AppService)

	constructor() {
		injectInput((input, key) => {
			if (key.upArrow) this.count.update((c) => c + 1)
			if (key.downArrow) this.count.update((c) => c - 1)
			if (input === 'q') this.app.exit()
		})
	}
}
