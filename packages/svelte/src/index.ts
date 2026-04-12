import type { Component } from 'svelte'
import { mount, unmount } from 'svelte'
import { EventEmitter } from 'node:events'
import ansiEscapes from 'ansi-escapes'
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
	type LayoutTree,
	type ElementNames,
	LoggedLayoutTree,
	logger,
} from '@wolf-tui/core'
import { LayoutTree as TaffyLayoutTree } from '@wolf-tui/core/layout'
import { throttle } from 'es-toolkit/compat'
import { createRenderScheduler } from '@wolf-tui/shared'
import signalExit from 'signal-exit'
import { patchGlobals, restoreGlobals } from './renderer/wolfie-document.js'
import { WolfieElement, setNodeOpsConfig } from './renderer/wolfie-element.js'
import { createFocusState } from './focus-state.svelte.js'
import type { ITheme } from '@wolf-tui/shared'
import {
	STDIN_CTX,
	STDOUT_CTX,
	STDERR_CTX,
	APP_CTX,
	FOCUS_CTX,
	ACCESSIBILITY_CTX,
	THEME_CTX,
} from './context/symbols.js'
import type {
	StdinContextValue,
	StdoutContextValue,
	StderrContextValue,
	AppContextValue,
	FocusContextValue,
	AccessibilityContextValue,
} from './context/types.js'
import ContextWrapper from './ContextWrapper.svelte'

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

interface SvelteApp {
	/** Svelte mount() return — opaque handle for unmount() */
	[key: string]: unknown
}

// infrastructure: mount() expects Element target, but WolfieElement is a virtual
// Element that satisfies the contract at runtime via patchGlobals(). This helper
// avoids type-level incompatibility without exposing any cast to consumers.
function mountToWolfieTarget(
	comp: Component,
	options: {
		target: WolfieElement
		props: Record<string, unknown>
		context: Map<symbol, unknown>
	}
): SvelteApp {
	// Svelte's mount reads .appendChild/.insertBefore/.firstChild from target,
	// all of which WolfieElement implements. Runtime contract is satisfied.
	const mountOptions = {
		...options,
		target: options.target as unknown as Element,
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- infrastructure: Svelte mount returns opaque object
	return mount(comp, mountOptions) as unknown as SvelteApp
}
//#endregion Types

//#region WolfieSvelte Class
class WolfieSvelte {
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
	private svelteApp?: SvelteApp
	private theme: ITheme

	//#region Focus State
	private focusables: Focusable[] = []
	private getActiveFocusId!: () => string | undefined
	private setActiveFocusId!: (id: string | undefined) => void
	private isFocusEnabled = true
	//#endregion Focus State

	constructor(options: RenderOptions = {}) {
		this.stdout = options.stdout || process.stdout
		this.stdin = options.stdin || process.stdin
		this.stderr = options.stderr || process.stderr
		this.theme = options.theme ?? { components: {} }

		// Use LoggedLayoutTree when logging is enabled — zero overhead otherwise
		this.layoutTree = logger.enabled
			? new LoggedLayoutTree(new TaffyLayoutTree(), logger)
			: new TaffyLayoutTree()
		this.rootNode = createNode(
			'wolfie-root' satisfies ElementNames,
			this.layoutTree
		)

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
			logger.log({
				ts: performance.now(),
				cat: 'input',
				op: 'stdin:data',
				key:
					input.length === 1
						? input
						: `[${Buffer.from(input).toString('hex')}]`,
			})
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

	//#region Terminal helpers
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
	//#endregion Terminal helpers

	//#region Layout
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
	//#endregion Layout

	//#region Rendering
	private onRender() {
		if (this.isUnmounted) return

		logger.log({
			ts: performance.now(),
			cat: 'svelte',
			op: 'onRender:start',
		})

		this.calculateLayout()
		const { output, outputHeight } = coreRenderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)

		logger.log({
			ts: performance.now(),
			cat: 'svelte',
			op: 'onRender:done',
			outputLen: output.length,
			outputHeight,
			changed: output !== this.lastOutput,
		})

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
	//#endregion Rendering

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

		const next = activeFocusables[nextIndex]
		if (next) this.setActiveFocusId(next.id)
	}

	private focusPrevious = () => {
		const activeFocusables = this.focusables.filter((f) => f.isActive)
		if (activeFocusables.length === 0) return

		const currentIndex = activeFocusables.findIndex(
			(f) => f.id === this.getActiveFocusId()
		)

		const prevIndex =
			currentIndex <= 0 ? activeFocusables.length - 1 : currentIndex - 1

		const prev = activeFocusables[prevIndex]
		if (prev) this.setActiveFocusId(prev.id)
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

	//#region Mount / Unmount
	render(UserComponent: Component) {
		// Reactive focus state — uses $state so Svelte components
		// reading activeFocusId() in $derived/$effect get tracked.
		const focusState = createFocusState()
		this.getActiveFocusId = focusState.get
		this.setActiveFocusId = (id) => {
			focusState.set(id)
			this.scheduleRender()
		}

		// Configure the DOM bridge
		setNodeOpsConfig({
			getLayoutTree: () => this.layoutTree,
			getScheduleRender: () => this.scheduleRender,
		})
		patchGlobals({
			getLayoutTree: () => this.layoutTree,
			getScheduleRender: () => this.scheduleRender,
		})

		// Create root WolfieElement wrapping the core rootNode
		const rootEl = new WolfieElement('wolfie-root', this.rootNode)

		// Build context values
		let rawModeRefCount = 0

		const stdinValue: StdinContextValue = {
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

		const stdoutValue: StdoutContextValue = {
			stdout: this.stdout,
			write: (data: string) => this.writeToStdout(data),
		}

		const stderrValue: StderrContextValue = {
			stderr: this.stderr,
			write: (data: string) => this.writeToStderr(data),
		}

		const appValue: AppContextValue = {
			exit: (error?: Error) => {
				if (error) {
					this.stderr.write(error.stack || error.message)
				}
				this.unmount()
				process.exit(error ? 1 : 0)
			},
		}

		const accessibilityValue: AccessibilityContextValue = {
			isScreenReaderEnabled: this.isScreenReaderEnabled,
		}

		const focusValue: FocusContextValue = {
			activeFocusId: this.getActiveFocusId,
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

		// Build context Map for mount()
		const contextMap = new Map<symbol, unknown>([
			[STDIN_CTX, stdinValue],
			[STDOUT_CTX, stdoutValue],
			[STDERR_CTX, stderrValue],
			[APP_CTX, appValue],
			[FOCUS_CTX, focusValue],
			[ACCESSIBILITY_CTX, accessibilityValue],
			[THEME_CTX, this.theme],
		])

		// infrastructure: WolfieElement satisfies Element at runtime via patchGlobals,
		// but TS doesn't know that — use mountToWolfieTarget helper
		this.svelteApp = mountToWolfieTarget(ContextWrapper, {
			target: rootEl,
			props: {
				stdinValue,
				stdoutValue,
				stderrValue,
				appValue,
				focusValue,
				accessibilityValue,
				themeValue: this.theme,
				component: UserComponent,
			},
			context: contextMap,
		})

		// Svelte's mount() is synchronous but actions (use:wolfieProps) execute
		// in Svelte's effect queue (microtask). Flushing immediately would render
		// the first frame with empty styles. Defer to next microtask so actions
		// have applied real styles to layout nodes before the first paint.
		queueMicrotask(() => this.flushRender())
	}

	unmount() {
		if (this.isUnmounted) return
		this.isUnmounted = true

		if (this.svelteApp) {
			// infrastructure: unmount expects the opaque return from mount()
			unmount(this.svelteApp as unknown as Record<string, never>)
		}

		restoreGlobals()

		if (this.unsubscribeResize) {
			this.unsubscribeResize()
		}

		this.log.done()
	}
	//#endregion Mount / Unmount
}
//#endregion WolfieSvelte Class

//#region Public API
export const render = (component: Component, options?: RenderOptions) => {
	const instance = new WolfieSvelte(options)
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
} from './styles/index.js'

export type { ClassNameValue } from './styles/index.js'
//#endregion Style Exports

//#region Theme Exports
export {
	extendTheme,
	defaultTheme,
	useComponentTheme,
	type ITheme,
	type IComponentTheme,
	type IComponentStyles,
} from './theme/index.js'
//#endregion Theme Exports

//#region Composable Exports
export { useApp } from './composables/use-app.js'
export { useInput } from './composables/use-input.js'
export { useFocus } from './composables/use-focus.js'
export { useFocusManager } from './composables/use-focus-manager.js'
export { useStdin } from './composables/use-stdin.js'
export { useStdout } from './composables/use-stdout.js'
export { useStderr } from './composables/use-stderr.js'
export { useIsScreenReaderEnabled } from './composables/use-is-screen-reader-enabled.js'
export { useSpinner } from './composables/use-spinner.svelte.js'
export type {
	UseSpinnerProps,
	UseSpinnerResult,
} from './composables/use-spinner.svelte.js'
export { useTextInputState } from './composables/use-text-input-state.svelte.js'
export type {
	UseTextInputStateProps,
	TextInputState,
} from './composables/use-text-input-state.svelte.js'
export { useTextInput } from './composables/use-text-input.js'
export type {
	UseTextInputProps,
	UseTextInputResult,
} from './composables/use-text-input.js'
export { usePasswordInputState } from './composables/use-password-input-state.svelte.js'
export type {
	UsePasswordInputStateProps,
	PasswordInputState,
} from './composables/use-password-input-state.svelte.js'
export { usePasswordInput } from './composables/use-password-input.js'
export type {
	UsePasswordInputProps,
	UsePasswordInputResult,
} from './composables/use-password-input.js'
export { useEmailInputState } from './composables/use-email-input-state.svelte.js'
export type {
	UseEmailInputStateProps,
	EmailInputState,
} from './composables/use-email-input-state.svelte.js'
export { useEmailInput } from './composables/use-email-input.js'
export type {
	UseEmailInputProps,
	UseEmailInputResult,
} from './composables/use-email-input.js'
export { useSelectState } from './composables/use-select-state.svelte.js'
export type {
	UseSelectStateProps,
	SelectState,
} from './composables/use-select-state.svelte.js'
export { useSelect } from './composables/use-select.js'
export type { UseSelectProps } from './composables/use-select.js'
export { useMultiSelectState } from './composables/use-multi-select-state.svelte.js'
export type {
	UseMultiSelectStateProps,
	MultiSelectState,
} from './composables/use-multi-select-state.svelte.js'
export { useMultiSelect } from './composables/use-multi-select.js'
export type { UseMultiSelectProps } from './composables/use-multi-select.js'
export { useTimerState } from './composables/use-timer-state.svelte.js'
export type {
	UseTimerStateProps,
	TimerStateResult,
} from './composables/use-timer-state.svelte.js'
export { useTimer } from './composables/use-timer.js'
export type { UseTimerProps } from './composables/use-timer.js'
export { useTreeViewState } from './composables/use-tree-view-state.svelte.js'
export type {
	UseTreeViewStateProps,
	TreeViewStateResult,
} from './composables/use-tree-view-state.svelte.js'
export { useTreeView } from './composables/use-tree-view.js'
export type { UseTreeViewProps } from './composables/use-tree-view.js'
export { useComboboxState } from './composables/use-combobox-state.svelte.js'
export type {
	UseComboboxStateProps,
	ComboboxStateResult,
} from './composables/use-combobox-state.svelte.js'
export { useCombobox } from './composables/use-combobox.js'
export type { UseComboboxProps } from './composables/use-combobox.js'
export { useJsonViewerState } from './composables/use-json-viewer-state.svelte.js'
export type {
	UseJsonViewerStateProps,
	JsonViewerStateResult,
} from './composables/use-json-viewer-state.svelte.js'
export { useJsonViewer } from './composables/use-json-viewer.js'
export type { UseJsonViewerProps } from './composables/use-json-viewer.js'
export { useFilePickerState } from './composables/use-file-picker-state.svelte.js'
export type {
	UseFilePickerStateProps,
	FilePickerStateResult,
} from './composables/use-file-picker-state.svelte.js'
export { useFilePicker } from './composables/use-file-picker.js'
export type { UseFilePickerProps } from './composables/use-file-picker.js'
//#endregion Composable Exports

//#region Component Exports
export * from './components/index.js'
//#endregion Component Exports

//#region WNode Bridge Exports
export { wNodeToSvelte, mountWNode } from './wnode/wnode-to-svelte.js'
//#endregion WNode Bridge Exports

//#region Renderer Re-exports
export { patchGlobals, restoreGlobals } from './renderer/wolfie-document.js'
export {
	WolfieNode,
	WolfieElement,
	WolfieText,
	WolfieComment,
	WolfieDocumentFragment,
	setNodeOpsConfig,
} from './renderer/wolfie-element.js'
export { wolfieProps } from './renderer/wolfie-action.js'
export { initLayoutTreeRecursively } from './renderer/init-layout-tree.js'
//#endregion Renderer Re-exports
