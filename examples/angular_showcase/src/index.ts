import 'zone.js'
import '@angular/compiler'
import { renderWolfie, type WolfieInstance } from '@wolf-tui/angular'
import { AppComponent } from './app.component'

export { AppComponent }

if (process.env['WOLFIE_VERIFY'] !== '1') {
	renderWolfie(AppComponent, {
		exitOnCtrlC: true,
	}).then((instance: WolfieInstance) => {
		instance.waitUntilExit()
	})
}
