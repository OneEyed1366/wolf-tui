import { extendTheme, defaultTheme, type ITheme } from '@wolfie/svelte'

//#region Brand Colors - Svelte
export const BRAND = {
	name: 'Svelte',
	primary: '#ff3e00', // Svelte orange
	primaryDark: '#cc3200', // Svelte darker orange
	bgDark: '#1a1a2e',
	bgDarker: '#16162a',
	bgAccent: '#242442',
	text: '#ffffff',
	textMuted: '#8b949e',
	success: '#42b883',
	error: '#f85149',
	warning: '#d29922',
} as const
//#endregion Brand Colors

//#region Theme Extension
export const invadersTheme: ITheme = extendTheme(defaultTheme, {
	components: {},
})
//#endregion Theme Extension
