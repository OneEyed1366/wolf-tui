import { type ReactNode, createContext, useContext } from 'react'
import { type ITheme, type IComponentTheme } from '@wolf-tui/shared'
import { badgeTheme } from '../components/Badge'
import { gradientTheme } from '../components/Gradient'
import { spinnerTheme } from '../components/Spinner'
import { progressBarTheme } from '../components/ProgressBar'
import { statusMessageTheme } from '../components/StatusMessage'
import { alertTheme } from '../components/Alert/theme'
import { orderedListTheme } from '../components/OrderedList/index'
import { unorderedListTheme } from '../components/UnorderedList/index'
import { confirmInputTheme } from '../components/ConfirmInput'
import { textInputTheme } from '../components/TextInput/index'
import { passwordInputTheme } from '../components/PasswordInput/index'
import { emailInputTheme } from '../components/EmailInput/index'
import { selectTheme } from '../components/Select/index'
import { multiSelectTheme } from '../components/MultiSelect/index'

export type {
	ITheme,
	IComponentTheme,
	IComponentStyles,
} from '@wolf-tui/shared'
export { extendTheme } from '@wolf-tui/shared'

export const defaultTheme: ITheme = {
	components: {
		Badge: badgeTheme,
		Gradient: gradientTheme,
		Spinner: spinnerTheme,
		ProgressBar: progressBarTheme,
		StatusMessage: statusMessageTheme,
		Alert: alertTheme,
		OrderedList: orderedListTheme,
		UnorderedList: unorderedListTheme,
		ConfirmInput: confirmInputTheme,
		TextInput: textInputTheme,
		PasswordInput: passwordInputTheme,
		EmailInput: emailInputTheme,
		Select: selectTheme,
		MultiSelect: multiSelectTheme,
	},
}

export const ThemeContext = createContext<ITheme>(defaultTheme)

export type ThemeProviderProps = {
	children: ReactNode
	theme: ITheme
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export const useComponentTheme = <Theme extends IComponentTheme>(
	component: string
): Theme => {
	const theme = useContext(ThemeContext)
	return theme.components[component] as Theme
}
