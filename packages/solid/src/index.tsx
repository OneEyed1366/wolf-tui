import { createSignal, type Accessor, type JSX } from 'solid-js'
import { EventEmitter } from 'node:events'
import ansiEscapes from 'ansi-escapes'
import { setRendererConfig, render as solidRender } from './renderer'
import {
	createNode,
	renderer as coreRenderer,
	logUpdate,
	type LogUpdate,
	squashTextNodes,
	measureText,
	wrapText,
	resolveViewportUnits,
	parseNumericValue,
	applyLayoutStyle,
	type DOMElement,
	type DOMNode,
	type LayoutTree,
	type ElementNames,
} from '@wolfie/core'
import { LayoutTree as TaffyLayoutTree } from '@wolfie/core/layout'
import { throttle } from 'es-toolkit/compat'
import { createRenderScheduler } from '@wolfie/shared'
import signalExit from 'signal-exit'
import {
	StdinCtx,
	StdoutCtx,
	StderrCtx,
	AppCtx,
	FocusCtx,
	AccessibilityCtx,
	ThemeCtx,
} from './context/symbols'
import type { ITheme } from '@wolfie/shared'

//#region Types
export interface RenderOptions {
	stdout?: NodeJS.WriteStream
	stdin?: NodeJS.ReadStream
	stderr?: NodeJS.WriteStream
	maxFps?: number
	debug?: boolean
	isScreenReaderEnabled?: boolean
	theme?: ITheme
	incrementalRendering?: boolean
}

interface Focusable {
	id: string
	isActive: boolean
}
//#endregion Types

//#region WolfieSolid Class
class WolfieSolid {
	private rootNode: DOMElement
	private stdout: NodeJS.WriteStream
	private stdin: NodeJS.ReadStream
	private stderr: NodeJS.WriteStream
	private log: LogUpdate
	private isUnmounted = false
	private layoutTree: LayoutTree
	private eventEmitter: EventEmitter
	private lastTerminalWidth: number
	private lastOutput = ''
	private lastOutputHeight = 0
	private isFirstRender = true
	private unsubscribeResize?: () => void
	private isScreenReaderEnabled: boolean
	private scheduleRender: () => void
	private flushRender: () => void
	private dispose?: () => void
	private theme: ITheme

	//#region Focus State
	private focusables: Focusable[] = []
	private getActiveFocusId!: Accessor<string | undefined>
	private setActiveFocusId!: (id: string | undefined) => void
	private isFocusEnabled = true
	//#endregion Focus State

	constructor(options: RenderOptions = {}) {
		this.stdout = options.stdout || process.stdout
		this.stdin = options.stdin || process.stdin
		this.stderr = options.stderr || process.stderr
		this.theme = options.theme ?? { components: {} }

		this.layoutTree = new TaffyLayoutTree()
		this.rootNode = createNode('wolfie-root' as ElementNames, this.layoutTree)

		this.log = logUpdate.create(this.stdout, {
			incremental: options.incrementalRendering ?? true,
		})
		this.eventEmitter = new EventEmitter()
		this.lastTerminalWidth = this.getTerminalWidth()

		this.isScreenReaderEnabled =
			options.isScreenReaderEnabled ??
			process.env['INK_SCREEN_READER'] === 'true'

		const unthrottled = options.debug === true || this.isScreenReaderEnabled
		const maxFps = options.maxFps ?? 30
		const renderThrottleMs =
			unthrottled || maxFps <= 0 ? 0 : Math.max(1, Math.ceil(1000 / maxFps))

		const renderFn = this.onRender.bind(this)
		const throttledRender =
			renderThrottleMs > 0
				? throttle(renderFn, renderThrottleMs, {
						leading: true,
						trailing: true,
					})
				: renderFn

		const { scheduleRender, flush } = createRenderScheduler(throttledRender, {
			sync: unthrottled,
			queueFn: (cb) => queueMicrotask(cb),
		})
		this.scheduleRender = scheduleRender
		this.flushRender = flush

		this.rootNode.onRender = scheduleRender

		this.rootNode.style = {
			flexDirection: 'column',
			alignItems: 'stretch',
		}

		this.stdin.on('data', (data: Buffer) => {
			const input = data.toString()
			this.handleFocusInput(input)
			this.eventEmitter.emit('input', input)
		})

		if (this.stdout.isTTY) {
			this.stdout.on('resize', this.resized)
			this.unsubscribeResize = () => {
				this.stdout.off('resize', this.resized)
			}
		}

		signalExit(() => this.unmount())
	}

	getTerminalWidth = () => {
		return this.stdout.columns || 80
	}

	resized = () => {
		const currentWidth = this.getTerminalWidth()

		if (currentWidth < this.lastTerminalWidth) {
			this.log.clear()
		}

		this.calculateLayout()
		this.flushRender()

		this.lastTerminalWidth = currentWidth
	}

	private preMeasureTextNodes(node: DOMElement, maxWidth: number): void {
		let effectiveMaxWidth = maxWidth
		const nodeWidth = node.style?.width
		if (typeof nodeWidth === 'number') {
			const paddingH =
				parseNumericValue(
					node.style?.paddingLeft ?? node.style?.paddingX ?? node.style?.padding
				) +
				parseNumericValue(
					node.style?.paddingRight ??
						node.style?.paddingX ??
						node.style?.padding
				)
			const borderH = node.style?.borderStyle ? 2 : 0
			effectiveMaxWidth = Math.max(0, nodeWidth - paddingH - borderH)
		}

		if (node.nodeName === 'wolfie-text' && node.layoutNodeId !== undefined) {
			const text = squashTextNodes(node)
			const textWrap = node.style?.textWrap ?? 'wrap'

			let dimensions = measureText(text)

			if (dimensions.width > effectiveMaxWidth) {
				const wrappedText = wrapText(text, effectiveMaxWidth, textWrap)
				dimensions = measureText(wrappedText)
			}

			this.layoutTree.setTextDimensions(
				node.layoutNodeId,
				dimensions.width,
				dimensions.height
			)
		}

		for (const child of node.childNodes) {
			if (child.nodeName !== '#text') {
				this.preMeasureTextNodes(child as DOMElement, effectiveMaxWidth)
			}
		}
	}

	private resolveViewportUnitsInTree(node: DOMElement): void {
		if (!node.style) return

		const terminalWidth = this.getTerminalWidth()
		const terminalHeight = this.stdout.rows || 24

		const hasViewportUnits = Object.values(node.style).some(
			(val) =>
				typeof val === 'string' &&
				(val.includes('vw') ||
					val.includes('vh') ||
					val.includes('vmin') ||
					val.includes('vmax'))
		)

		if (hasViewportUnits) {
			const resolvedStyle = resolveViewportUnits(
				node.style,
				terminalWidth,
				terminalHeight
			)

			for (const [key, value] of Object.entries(resolvedStyle)) {
				node.style[key] = value
			}

			if (node.layoutNodeId !== undefined) {
				applyLayoutStyle(this.layoutTree, node.layoutNodeId, resolvedStyle)
			}
		}

		for (const child of node.childNodes) {
			if (child.nodeName !== '#text') {
				this.resolveViewportUnitsInTree(child as DOMElement)
			}
		}
	}

	calculateLayout = () => {
		const terminalWidth = this.getTerminalWidth()

		if (this.rootNode.layoutNodeId !== undefined) {
			this.resolveViewportUnitsInTree(this.rootNode)
			this.preMeasureTextNodes(this.rootNode, terminalWidth)

			const rootStyle: Record<string, unknown> = {
				flexDirection: 'column',
				alignItems: 'stretch',
			}

			if (!this.rootNode.style?.width) {
				rootStyle.width = { value: terminalWidth, unit: 'px' }
			}

			this.layoutTree.setStyle(this.rootNode.layoutNodeId, rootStyle)
			this.layoutTree.computeLayout(this.rootNode.layoutNodeId, terminalWidth)
		}
	}

	private onRender() {
		if (this.isUnmounted) return

		this.calculateLayout()
		const { output, outputHeight } = coreRenderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)

		if (
			this.stdout.isTTY &&
			(this.isFirstRender || this.lastOutputHeight >= this.stdout.rows)
		) {
			this.stdout.write(ansiEscapes.clearTerminal + output)
			this.lastOutput = output
			this.lastOutputHeight = outputHeight
			this.log.sync(output)
			this.isFirstRender = false
			return
		}

		if (output !== this.lastOutput) {
			this.log(output)
		}

		this.lastOutput = output
		this.lastOutputHeight = outputHeight
	}

	writeToStdout(data: string): void {
		if (this.isUnmounted) return
		this.log.clear()
		this.stdout.write(data)
		const { output, outputHeight } = coreRenderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)
		this.log(output)
		this.lastOutput = output
		this.lastOutputHeight = outputHeight
	}

	writeToStderr(data: string): void {
		if (this.isUnmounted) return
		this.log.clear()
		this.stderr.write(data)
		const { output, outputHeight } = coreRenderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)
		this.log(output)
		this.lastOutput = output
		this.lastOutputHeight = outputHeight
	}

	//#region Focus Management
	private addFocusable = (id: string, options: { autoFocus: boolean }) => {
		this.focusables.push({ id, isActive: true })
		if (options.autoFocus && this.getActiveFocusId() === undefined) {
			this.setActiveFocusId(id)
		}
	}

	private removeFocusable = (id: string) => {
		this.focusables = this.focusables.filter((f) => f.id !== id)
		if (this.getActiveFocusId() === id) {
			this.setActiveFocusId(undefined)
		}
	}

	private activateFocusable = (id: string) => {
		const focusable = this.focusables.find((f) => f.id === id)
		if (focusable) {
			focusable.isActive = true
		}
	}

	private deactivateFocusable = (id: string) => {
		const focusable = this.focusables.find((f) => f.id === id)
		if (focusable) {
			focusable.isActive = false
			if (this.getActiveFocusId() === id) {
				this.focusNext()
			}
		}
	}

	private focusNext = () => {
		const activeFocusables = this.focusables.filter((f) => f.isActive)
		if (activeFocusables.length === 0) return

		const currentIndex = activeFocusables.findIndex(
			(f) => f.id === this.getActiveFocusId()
		)

		const nextIndex =
			currentIndex === -1 || currentIndex >= activeFocusables.length - 1
				? 0
				: currentIndex + 1

		this.setActiveFocusId(activeFocusables[nextIndex]!.id)
	}

	private focusPrevious = () => {
		const activeFocusables = this.focusables.filter((f) => f.isActive)
		if (activeFocusables.length === 0) return

		const currentIndex = activeFocusables.findIndex(
			(f) => f.id === this.getActiveFocusId()
		)

		const prevIndex =
			currentIndex <= 0 ? activeFocusables.length - 1 : currentIndex - 1

		this.setActiveFocusId(activeFocusables[prevIndex]!.id)
	}

	private focus = (id: string) => {
		const focusable = this.focusables.find((f) => f.id === id && f.isActive)
		if (focusable) {
			this.setActiveFocusId(id)
		}
	}

	private enableFocus = () => {
		this.isFocusEnabled = true
	}

	private disableFocus = () => {
		this.isFocusEnabled = false
	}

	private handleFocusInput = (input: string) => {
		if (input === '\u001B') {
			this.setActiveFocusId(undefined)
			return
		}

		if (!this.isFocusEnabled || this.focusables.length === 0) return

		if (input === '\t') {
			this.focusNext()
		}

		if (input === '\u001B[Z') {
			this.focusPrevious()
		}
	}
	//#endregion Focus Management

	render(App: (props?: any) => JSX.Element) {
		const [getActiveFocusId, setActiveFocusId] = createSignal<
			string | undefined
		>(undefined)
		this.getActiveFocusId = getActiveFocusId
		this.setActiveFocusId = setActiveFocusId

		setRendererConfig({
			getLayoutTree: () => this.layoutTree,
			getScheduleRender: () => this.scheduleRender,
		})

		let rawModeRefCount = 0

		const stdinValue = {
			stdin: this.stdin,
			setRawMode: (value: boolean) => {
				if (this.stdin.isTTY) {
					if (value) {
						rawModeRefCount++
						if (rawModeRefCount === 1) {
							this.stdin.setRawMode(true)
						}
					} else {
						rawModeRefCount = Math.max(0, rawModeRefCount - 1)
						if (rawModeRefCount === 0) {
							this.stdin.setRawMode(false)
						}
					}
				}
			},
			isRawModeSupported: this.stdin.isTTY ?? false,
			internal_exitOnCtrlC: true,
			internal_eventEmitter: this.eventEmitter,
		}

		const stdoutValue = {
			stdout: this.stdout,
			write: (data: string) => this.writeToStdout(data),
		}

		const stderrValue = {
			stderr: this.stderr,
			write: (data: string) => this.writeToStderr(data),
		}

		const appValue = {
			exit: (error?: Error) => {
				if (error) {
					this.stderr.write(error.stack || error.message)
				}
				this.unmount()
				process.exit(error ? 1 : 0)
			},
		}

		const accessibilityValue = {
			isScreenReaderEnabled: this.isScreenReaderEnabled,
		}

		const focusValue = {
			activeFocusId: getActiveFocusId,
			add: this.addFocusable,
			remove: this.removeFocusable,
			activate: this.activateFocusable,
			deactivate: this.deactivateFocusable,
			focusNext: this.focusNext,
			focusPrevious: this.focusPrevious,
			focus: this.focus,
			enableFocus: this.enableFocus,
			disableFocus: this.disableFocus,
		}

		const theme = this.theme

		// Wrap App with all context providers
		const ContextWrapper = () => (
			<StdinCtx.Provider value={stdinValue}>
				<StdoutCtx.Provider value={stdoutValue}>
					<StderrCtx.Provider value={stderrValue}>
						<AppCtx.Provider value={appValue}>
							<AccessibilityCtx.Provider value={accessibilityValue}>
								<FocusCtx.Provider value={focusValue}>
									<ThemeCtx.Provider value={theme}>
										<App />
									</ThemeCtx.Provider>
								</FocusCtx.Provider>
							</AccessibilityCtx.Provider>
						</AppCtx.Provider>
					</StderrCtx.Provider>
				</StdoutCtx.Provider>
			</StdinCtx.Provider>
		)

		this.dispose = solidRender(
			ContextWrapper as unknown as () => DOMNode,
			this.rootNode as DOMNode
		)

		this.flushRender()
	}

	unmount() {
		if (this.isUnmounted) return
		this.isUnmounted = true

		if (this.dispose) {
			this.dispose()
		}

		if (this.unsubscribeResize) {
			this.unsubscribeResize()
		}

		this.log.done()
	}
}
//#endregion WolfieSolid Class

//#region Public API
export const render = (
	component: (props?: any) => JSX.Element,
	options?: RenderOptions
) => {
	const instance = new WolfieSolid(options)
	instance.render(component)
	return instance
}

//#endregion Public API

//#region Style Exports
export {
	registerStyles,
	registerTailwindMetadata,
	clearGlobalStyles,
	getGlobalStyle,
	resolveClassName,
} from './styles'

export type { ClassNameValue } from './styles'
//#endregion Style Exports

//#region Theme Exports
export {
	extendTheme,
	defaultTheme,
	useComponentTheme,
	type ITheme,
	type IComponentTheme,
	type IComponentStyles,
} from './theme'
//#endregion Theme Exports

//#region Component Exports
export * from './components'
//#endregion Component Exports

//#region Composable Exports
export { useApp } from './composables/use-app'
export { useInput } from './composables/use-input'
export { useFocus } from './composables/use-focus'
export { useFocusManager } from './composables/use-focus-manager'
export { useStdin } from './composables/use-stdin'
export { useStdout } from './composables/use-stdout'
export { useStderr } from './composables/use-stderr'
export { useIsScreenReaderEnabled } from './composables/use-is-screen-reader-enabled'
export { useSpinner } from './composables/use-spinner'
export type {
	UseSpinnerProps,
	UseSpinnerResult,
} from './composables/use-spinner'
export { useTextInputState } from './composables/use-text-input-state'
export type {
	UseTextInputStateProps,
	TextInputState,
} from './composables/use-text-input-state'
export { useTextInput } from './composables/use-text-input'
export type {
	UseTextInputProps,
	UseTextInputResult,
} from './composables/use-text-input'
export { usePasswordInputState } from './composables/use-password-input-state'
export type {
	UsePasswordInputStateProps,
	PasswordInputState,
} from './composables/use-password-input-state'
export { usePasswordInput } from './composables/use-password-input'
export type {
	UsePasswordInputProps,
	UsePasswordInputResult,
} from './composables/use-password-input'
export { useEmailInputState } from './composables/use-email-input-state'
export type {
	UseEmailInputStateProps,
	EmailInputState,
} from './composables/use-email-input-state'
export { useEmailInput } from './composables/use-email-input'
export type {
	UseEmailInputProps,
	UseEmailInputResult,
} from './composables/use-email-input'
export { useSelectState } from './composables/use-select-state'
export type {
	UseSelectStateProps,
	SelectState,
} from './composables/use-select-state'
export { useSelect } from './composables/use-select'
export type { UseSelectProps } from './composables/use-select'
export { useMultiSelectState } from './composables/use-multi-select-state'
export type {
	UseMultiSelectStateProps,
	MultiSelectState,
} from './composables/use-multi-select-state'
export { useMultiSelect } from './composables/use-multi-select'
export type { UseMultiSelectProps } from './composables/use-multi-select'
//#endregion Composable Exports

//#region Solid Re-exports
export {
	createSignal,
	createEffect,
	createMemo,
	createComputed,
	createResource,
	onMount,
	onCleanup,
	batch,
	untrack,
	on,
	createContext,
	useContext,
	Show,
	For,
	Switch,
	Match,
	Index,
	ErrorBoundary,
	Suspense,
	children,
	mergeProps,
	splitProps,
} from 'solid-js'
//#endregion Solid Re-exports
