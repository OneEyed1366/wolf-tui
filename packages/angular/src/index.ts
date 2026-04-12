// Main orchestrator
export {
	WolfieAngular,
	layoutTreeRegistry,
	type WolfieOptions,
	type WolfieAngularInstance,
} from './wolfie-angular'

// Bootstrap
export {
	renderWolfie,
	render,
	type RenderOptions,
	type WolfieInstance,
} from './bootstrap'

// Renderer
export { WolfieRenderer } from './renderer/wolfie-renderer'
export {
	WolfieRendererFactory,
	createWolfieRendererFactory,
} from './renderer/wolfie-renderer-factory'

// Tokens
export {
	STDIN_CONTEXT,
	STDOUT_CONTEXT,
	STDERR_CONTEXT,
	APP_CONTEXT,
	ACCESSIBILITY_CONTEXT,
	BACKGROUND_CONTEXT,
	FOCUS_CONTEXT,
	WOLFIE_INSTANCE,
	type StdinContext,
	type StdoutContext,
	type StderrContext,
	type AppContext,
	type AccessibilityContext,
	type BackgroundContext,
	type FocusContext,
	type Focusable,
} from './tokens'

// Services
export {
	StdinService,
	StdoutService,
	StderrService,
	AppService,
	FocusService,
	injectInput,
	type Key,
	type InputHandler,
	type InputOptions,
	type FocusOptions,
} from './services'

// Components
export {
	WNodeOutletComponent,
	BoxComponent,
	TextComponent,
	NewlineComponent,
	SpacerComponent,
	StaticComponent,
	TransformComponent,
	// Display Components
	AlertComponent,
	type AlertVariant,
	type AlertProps,
	BadgeComponent,
	type BadgeProps,
	SpinnerComponent,
	type SpinnerProps,
	StatusMessageComponent,
	type StatusMessageVariant,
	type StatusMessageProps,
	ProgressBarComponent,
	type ProgressBarProps,
	// List Components
	OrderedListComponent,
	type OrderedListProps,
	OrderedListItemComponent,
	type OrderedListItemProps,
	UnorderedListComponent,
	type UnorderedListProps,
	UnorderedListItemComponent,
	type UnorderedListItemProps,
	// Input Components
	TextInputComponent,
	type TextInputProps,
	PasswordInputComponent,
	type PasswordInputProps,
	EmailInputComponent,
	type EmailInputProps,
	ConfirmInputComponent,
	type ConfirmInputProps,
	// Select Components
	SelectComponent,
	type SelectProps,
	SelectOptionComponent,
	type SelectOptionProps,
	MultiSelectComponent,
	type MultiSelectProps,
	MultiSelectOptionComponent,
	type MultiSelectOptionProps,
	// Error Components
	ErrorOverviewComponent,
	type ErrorOverviewProps,
	// Community Components
	TimerComponent,
	type TimerProps,
	TreeViewComponent,
	type TreeViewProps,
	ComboboxComponent,
	type ComboboxProps,
	JsonViewerComponent,
	type JsonViewerProps,
	FilePickerComponent,
	type FilePickerProps,
} from './components'

// Styles
export {
	registerStyles,
	registerTailwindMetadata,
	clearGlobalStyles,
	getGlobalStyle,
	resolveClassName,
	type ClassNameValue,
} from './styles'

// Types
export { type Option } from '@wolf-tui/shared'

// Theme
export {
	THEME_CONTEXT,
	extendTheme,
	defaultTheme,
	useComponentTheme,
	type ITheme,
	type IComponentTheme,
	type IComponentStyles,
} from './theme'
