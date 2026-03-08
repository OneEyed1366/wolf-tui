import { render } from '@wolfie/svelte'
import App from './App.svelte'

// Wolfie CSS styles — wolfie plugin transforms these into registerStyles() calls
import './styles/tailwind.css'
import './styles/global.css'

render(App, { maxFps: 30 })
