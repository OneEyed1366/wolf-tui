import { Component, signal, inject } from '@angular/core'
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
		<w-box flexDirection="column" [padding]="1">
			<w-text [bold]="true">wolf-tui Counter</w-text>
			<w-text>Count: {{ count() }}</w-text>
			<w-text [dimColor]="true">↑/↓ to change, q to quit</w-text>
		</w-box>
	`,
})
export class AppComponent {
	count = signal(0)
	private app = inject(AppService)

	constructor() {
		injectInput((input, key) => {
			if (key.upArrow) this.count.update((c) => c + 1)
			if (key.downArrow) this.count.update((c) => c - 1)
			if (input === 'q') this.app.exit()
		})
	}
}
