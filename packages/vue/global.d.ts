/**
 * Global component type augmentation for @wolf-tui/vue.
 *
 * Add this reference to your project's env.d.ts or shims-vue.d.ts
 * to enable Volar/vue-tsc to recognize Wolfie components in templates:
 *
 * @example
 * ```ts
 * /// <reference types="@wolf-tui/vue/global" />
 * ```
 *
 * Or import it in your main entry file:
 * @example
 * ```ts
 * import '@wolf-tui/vue/global'
 * ```
 */

import type { DefineComponent } from 'vue'
import type {
	BoxProps,
	TextProps,
	NewlineProps,
	StaticProps,
	TransformProps,
	AlertProps,
	BadgeProps,
	SpinnerProps,
	StatusMessageProps,
	ProgressBarProps,
	OrderedListProps,
	UnorderedListProps,
	TextInputProps,
	PasswordInputProps,
	EmailInputProps,
	ConfirmInputProps,
	SelectProps,
	SelectOptionProps,
	MultiSelectProps,
	MultiSelectOptionProps,
	ErrorOverviewProps,
} from './build/index.js'

//#region Component Type Definitions
type BoxComponent = DefineComponent<BoxProps>
type TextComponent = DefineComponent<TextProps>
type NewlineComponent = DefineComponent<NewlineProps>
type SpacerComponent = DefineComponent<Record<string, never>>
type StaticComponent = DefineComponent<StaticProps<unknown>>
type TransformComponent = DefineComponent<TransformProps>
type AlertComponent = DefineComponent<AlertProps>
type BadgeComponent = DefineComponent<BadgeProps>
type SpinnerComponent = DefineComponent<SpinnerProps>
type StatusMessageComponent = DefineComponent<StatusMessageProps>
type ProgressBarComponent = DefineComponent<ProgressBarProps>
type OrderedListComponent = DefineComponent<OrderedListProps> & {
	Item: DefineComponent<{ children?: unknown }>
}
type UnorderedListComponent = DefineComponent<UnorderedListProps> & {
	Item: DefineComponent<{ children?: unknown }>
}
type TextInputComponent = DefineComponent<TextInputProps>
type PasswordInputComponent = DefineComponent<PasswordInputProps>
type EmailInputComponent = DefineComponent<EmailInputProps>
type ConfirmInputComponent = DefineComponent<ConfirmInputProps>
type SelectComponent = DefineComponent<SelectProps>
type SelectOptionComponent = DefineComponent<SelectOptionProps>
type MultiSelectComponent = DefineComponent<MultiSelectProps>
type MultiSelectOptionComponent = DefineComponent<MultiSelectOptionProps>
type ErrorOverviewComponent = DefineComponent<ErrorOverviewProps>
//#endregion Component Type Definitions

declare module '@vue/runtime-core' {
	export interface GlobalComponents {
		//#region Core
		Box: BoxComponent
		Text: TextComponent
		//#endregion Core

		//#region Static Output
		Newline: NewlineComponent
		Spacer: SpacerComponent
		Static: StaticComponent
		Transform: TransformComponent
		//#endregion Static Output

		//#region Display
		Alert: AlertComponent
		Badge: BadgeComponent
		Spinner: SpinnerComponent
		StatusMessage: StatusMessageComponent
		ProgressBar: ProgressBarComponent
		//#endregion Display

		//#region Lists
		OrderedList: OrderedListComponent
		UnorderedList: UnorderedListComponent
		//#endregion Lists

		//#region Input
		TextInput: TextInputComponent
		PasswordInput: PasswordInputComponent
		EmailInput: EmailInputComponent
		ConfirmInput: ConfirmInputComponent
		Select: SelectComponent
		SelectOption: SelectOptionComponent
		MultiSelect: MultiSelectComponent
		MultiSelectOption: MultiSelectOptionComponent
		//#endregion Input

		//#region Error
		ErrorOverview: ErrorOverviewComponent
		//#endregion Error
	}
}

export {}
