import type { EventEmitter } from 'node:events'

//#region Context Value Interfaces

export interface StdinContextValue {
	stdin: NodeJS.ReadStream
	setRawMode: (value: boolean) => void
	isRawModeSupported: boolean
	internal_exitOnCtrlC: boolean
	internal_eventEmitter: EventEmitter
}

export interface StdoutContextValue {
	stdout: NodeJS.WriteStream
	write: (data: string) => void
}

export interface StderrContextValue {
	stderr: NodeJS.WriteStream
	write: (data: string) => void
}

export interface AppContextValue {
	exit: (error?: Error) => void
}

export interface FocusContextValue {
	activeFocusId: () => string | undefined
	add: (id: string, options: { autoFocus: boolean }) => void
	remove: (id: string) => void
	activate: (id: string) => void
	deactivate: (id: string) => void
	focusNext: () => void
	focusPrevious: () => void
	focus: (id: string) => void
	enableFocus: () => void
	disableFocus: () => void
}

export interface AccessibilityContextValue {
	isScreenReaderEnabled: boolean
}

//#endregion Context Value Interfaces
