import { render } from '@wolf-tui/vue'
import App from './App.vue'

export { default as App } from './App.vue'

//#region Entry
if (process.env['WOLFIE_VERIFY'] !== '1') {
	render(App, {
		maxFps: 30,
	})
}
//#endregion Entry
