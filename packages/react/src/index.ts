export type { RenderOptions, Instance } from './render'
export { default as render } from './render'
export {
	default as Wolfie,
	type IOptions as Options,
	type IRenderMetrics as RenderMetrics,
} from './wolfie_react'

// Components
export { Box } from './components/Box'
export type { Props as BoxProps } from './components/Box/types'
export { Text } from './components/Text'
export type { Props as TextProps } from './components/Text/types'
export { Static } from './components/Static'
export type { Props as StaticProps } from './components/Static/types'
export { Transform } from './components/Transform'
export type { Props as TransformProps } from './components/Transform/types'
export { Newline } from './components/Newline'
export type { Props as NewlineProps } from './components/Newline/types'
export { Spacer } from './components/Spacer'
export { ScrollView } from './components/ScrollView'
export type {
	IScrollViewProps,
	IScrollViewHandle,
} from './components/ScrollView/types'

export {
	Alert,
	type AlertProps,
	type AlertVariant,
	alertTheme,
} from './components/Alert'
export { App } from './components/App'
export type { IProps as AppProps } from './components/App/types'
export { Badge, type BadgeProps, badgeTheme } from './components/Badge'
export {
	ConfirmInput,
	type ConfirmInputProps,
	confirmInputTheme,
} from './components/ConfirmInput'
export {
	EmailInput,
	type EmailInputProps,
	emailInputTheme,
} from './components/EmailInput'
export {
	ErrorOverview,
	type Props as ErrorOverviewProps,
} from './components/ErrorOverview'
export {
	MultiSelect,
	type MultiSelectProps,
	MultiSelectOption,
	type MultiSelectOptionProps,
	multiSelectTheme,
} from './components/MultiSelect'
export {
	OrderedList,
	type OrderedListProps,
	OrderedListItem,
	type OrderedListItemProps,
	orderedListTheme,
} from './components/OrderedList'
export {
	PasswordInput,
	type PasswordInputProps,
	passwordInputTheme,
} from './components/PasswordInput'
export {
	ProgressBar,
	type ProgressBarProps,
	progressBarTheme,
} from './components/ProgressBar'
export {
	Select,
	type SelectProps,
	SelectOption,
	type SelectOptionProps,
	selectTheme,
} from './components/Select'
export { Spinner, type SpinnerProps, spinnerTheme } from './components/Spinner'
export {
	StatusMessage,
	type StatusMessageProps,
	type StatusMessageVariant,
	statusMessageTheme,
} from './components/StatusMessage'
export {
	TextInput,
	type TextInputProps,
	textInputTheme,
} from './components/TextInput'
export { Timer, type TimerProps, timerTheme } from './components/Timer'
export {
	TreeView,
	type TreeViewProps,
	treeViewTheme,
} from './components/TreeView'
export {
	Combobox,
	type ComboboxProps,
	comboboxTheme,
} from './components/Combobox'
export {
	JsonViewer,
	type JsonViewerProps,
	jsonViewerTheme,
} from './components/JsonViewer'
export {
	FilePicker,
	type FilePickerProps,
	filePickerTheme,
} from './components/FilePicker'
export {
	UnorderedList,
	type UnorderedListProps,
	UnorderedListItem,
	type UnorderedListItemProps,
	unorderedListTheme,
} from './components/UnorderedList'

// Hooks
export { useInput, type IKey as Key } from './hooks/use-input'
export { useApp } from './hooks/use-app'
export { useStdin } from './hooks/use-stdin'
export { useStdout } from './hooks/use-stdout'
export { useStderr } from './hooks/use-stderr'
export { useFocus } from './hooks/use-focus'
export { useFocusManager } from './hooks/use-focus-manager'
export { useIsScreenReaderEnabled } from './hooks/use-is-screen-reader-enabled'
export {
	useSpinner,
	type UseSpinnerProps,
	type UseSpinnerResult,
} from './components/use-spinner'

// Context
export { backgroundContext } from './context/BackgroundContext'

// Context Props
export type { IProps as AppContextProps } from './context/AppContext'
export type { IProps as StdinProps } from './context/StdinContext'
export type { IProps as StdoutProps } from './context/StdoutContext'
export type { IProps as StderrProps } from './context/StderrContext'

// Core
export {
	nonAlphanumericKeys,
	measureElement,
	type DOMElement,
} from '@wolf-tui/core'

// Theme system
export * from './theme/theme'

// Style registry for className support
export {
	registerStyles,
	clearGlobalStyles,
	getGlobalStyle,
	resolveClassName,
} from './styles/index'
export type { ClassNameValue } from './styles/index'
