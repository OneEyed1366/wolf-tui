import { render } from '@wolfie/svelte'
import App from './App.svelte'
import './styles/tailwind.css'

export { default as App } from './App.svelte'

//#region Render Configuration
if (process.env['WOLFIE_VERIFY'] !== '1') {
	render(App, {
		maxFps: 30,
	})
}
//#endregion Render Configuration
