import type { Option } from '../types'

//#region Select
export type SelectViewState = {
	visibleOptions: Option[]
	focusedValue: string | undefined
	value: string | undefined
	isDisabled: boolean
	highlightText?: string
}
//#endregion Select

//#region MultiSelect
export type MultiSelectViewState = {
	visibleOptions: Option[]
	focusedValue: string | undefined
	value: string[]
	isDisabled: boolean
	highlightText?: string
}
//#endregion MultiSelect

//#region TextInput
export type TextInputViewState = {
	/** Pre-rendered string with cursor chars included. */
	inputValue: string
}
//#endregion TextInput

//#region ConfirmInput
export type ConfirmInputViewState = {
	defaultChoice: 'confirm' | 'cancel'
	isDisabled: boolean
}
//#endregion ConfirmInput

//#region Alert
export type AlertVariant = 'info' | 'success' | 'error' | 'warning'

export type AlertViewState = {
	variant: AlertVariant
	title?: string
	message: string
}
//#endregion Alert

//#region Badge
export type BadgeViewState = {
	label: string
	color?: string
}
//#endregion Badge

//#region StatusMessage
export type StatusMessageVariant = 'info' | 'success' | 'error' | 'warning'

export type StatusMessageViewState = {
	variant: StatusMessageVariant
	message: string
}
//#endregion StatusMessage

//#region Spinner
export type SpinnerViewState = {
	frame: string
	label?: string
}
//#endregion Spinner

//#region ProgressBar
export type ProgressBarViewState = {
	value: number
	width: number
}
//#endregion ProgressBar

//#region ErrorOverview
export type ErrorOverviewStackFrame =
	| { parsed: true; fn?: string; file?: string; line?: number; column?: number }
	| { parsed: false; raw: string }

export type ErrorOverviewData = {
	message: string
	origin?: { filePath?: string; line?: number; column?: number }
	excerpt?: Array<{ line: number; value: string }>
	lineWidth: number
	stackFrames: ErrorOverviewStackFrame[]
}
//#endregion ErrorOverview
