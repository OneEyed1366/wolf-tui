import { getContext } from 'svelte'
import { type ITheme, type IComponentTheme } from '@wolfie/shared'
import { THEME_KEY } from '../context/keys'

export type { ITheme, IComponentTheme, IComponentStyles } from '@wolfie/shared'
export { extendTheme } from '@wolfie/shared'

export const defaultTheme: ITheme = {
	components: {},
}

export const useComponentTheme = <Theme extends IComponentTheme>(
	component: string
): Theme | undefined => {
	const theme = getContext<ITheme>(THEME_KEY) ?? defaultTheme
	return theme.components[component] as Theme | undefined
}
