import { getContext } from 'svelte'
import { type ITheme, type IComponentTheme } from '@wolfie/shared'
import { THEME_CTX } from '../context/symbols.js'

export type { ITheme, IComponentTheme, IComponentStyles } from '@wolfie/shared'
export { extendTheme } from '@wolfie/shared'

export const defaultTheme: ITheme = {
	components: {},
}

export const useComponentTheme = <Theme extends IComponentTheme>(
	component: string
): Theme | undefined => {
	const theme = getContext<ITheme>(THEME_CTX) ?? defaultTheme
	const componentTheme = theme.components[component]
	if (!componentTheme) return undefined

	// Type guard: IComponentTheme must have a 'styles' or known shape
	// Theme lookup is framework-internal, component key is known at call site
	return componentTheme as Theme
}
