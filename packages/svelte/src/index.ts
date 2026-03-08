import { writable, get } from 'svelte/store'
import { mount, unmount, type Component } from 'svelte'
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
	type ElementNames,
} from '@wolfie/core'
import { LayoutTree as TaffyLayoutTree } from '@wolfie/core/layout'
import { throttle } from 'es-toolkit/compat'
import { createRenderScheduler } from '@wolfie/shared'
import type { ITheme } from '@wolfie/shared'
import signalExit from 'signal-exit'
import {
	STDIN_KEY,
	STDOUT_KEY,
	STDERR_KEY,
	APP_KEY,
	FOCUS_KEY,
	ACCESSIBILITY_KEY,
	THEME_KEY,
} from './context/keys'
import { installDocument, WolfieElement } from './renderer'

//#region Types
export interface RenderOptions {
	stdout?: NodeJS.WriteStream
	stdin?: NodeJS.ReadStream
	stderr?: NodeJS.WriteStream
	maxFps?: number
	debug?: boolean
	isScreenReaderEnabled?: boolean
	theme?: ITheme
}

interface Focusable {
	id: string
	isActive: boolean
}
//#endregion Types

//#region WolfieSvelte
class WolfieSvelte {
	private rootEl: DOMElement
	private stdout: NodeJS.WriteStream
	private stdin: NodeJS.ReadStream
	private stderr: NodeJS.WriteStream
	private log: LogUpdate
	private isUnmounted = false
	private layoutTree: InstanceType<typeof TaffyLayoutTree>
	private eventEmitter = new EventEmitter()
	private lastTerminalWidth: number
	private lastOutput = ''
	private lastOutputHeight = 0
	private isFirstRender = true
	private unsubscribeResize?: () => void
	private isScreenReaderEnabled: boolean
	private scheduleRender!: () => void
	private flushRender!: () => void
	private mounted: Record<string, unknown> | undefined
	private uninstallDoc?: () => void
	private theme: ITheme

	//#region Focus State
	private focusables: Focusable[] = []
	private activeFocusId = writable<string | undefined>(undefined)
	private isFocusEnabled = true
	//#endregion Focus State

	constructor(options: RenderOptions = {}) {
		this.stdout = options.stdout ?? process.stdout
		this.stdin = options.stdin ?? process.stdin
		this.stderr = options.stderr ?? process.stderr
		this.theme = options.theme ?? { components: {} }
		this.isScreenReaderEnabled =
			options.isScreenReaderEnabled ??
			process.env['INK_SCREEN_READER'] === 'true'

		this.layoutTree = new TaffyLayoutTree()
		this.rootEl = createNode('wolfie-root' as ElementNames, this.layoutTree)
		this.log = logUpdate.create(this.stdout)
		this.lastTerminalWidth = this.getTerminalWidth()

		this.rootEl.style = {
			flexDirection: 'column',
			alignItems: 'stretch',
		}

		const unthrottled = options.debug === true || this.isScreenReaderEnabled
		const maxFps = options.maxFps ?? 30
		const ms =
			unthrottled || maxFps <= 0 ? 0 : Math.max(1, Math.ceil(1000 / maxFps))
		const renderFn = this.onRender.bind(this)
		const throttledRender =
			ms > 0
				? throttle(renderFn, ms, { leading: true, trailing: true })
				: renderFn
		const { scheduleRender, flush } = createRenderScheduler(throttledRender, {
			sync: unthrottled,
			queueFn: (cb) => queueMicrotask(cb),
		})
		this.scheduleRender = scheduleRender
		this.flushRender = flush
		this.rootEl.onRender = scheduleRender

		this.stdin.on('data', (data: Buffer) => {
			const input = data.toString()
			this.handleFocusInput(input)
			this.eventEmitter.emit('input', input)
		})

		if (this.stdout.isTTY) {
			this.stdout.on('resize', this.resized)
			this.unsubscribeResize = () => this.stdout.off('resize', this.resized)
		}

		signalExit(() => this.unmount())
	}

	private getTerminalWidth = (): number => this.stdout.columns ?? 80

	private resized = (): void => {
		const w = this.getTerminalWidth()
		if (w < this.lastTerminalWidth) this.log.clear()
		this.calculateLayout()
		this.flushRender()
		this.lastTerminalWidth = w
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
		const terminalHeight = this.stdout.rows ?? 24
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

	private calculateLayout = (): void => {
		const terminalWidth = this.getTerminalWidth()
		if (this.rootEl.layoutNodeId !== undefined) {
			this.resolveViewportUnitsInTree(this.rootEl)
			this.preMeasureTextNodes(this.rootEl, terminalWidth)
			const rootStyle: Record<string, unknown> = {
				flexDirection: 'column',
				alignItems: 'stretch',
			}
			if (!this.rootEl.style?.width) {
				rootStyle.width = { value: terminalWidth, unit: 'px' }
			}
			this.layoutTree.setStyle(this.rootEl.layoutNodeId, rootStyle)
			this.layoutTree.computeLayout(this.rootEl.layoutNodeId, terminalWidth)
		}
	}

	private onRender(): void {
		if (this.isUnmounted) return
		this.calculateLayout()
		const { output, outputHeight } = coreRenderer(
			this.rootEl,
			this.isScreenReaderEnabled,
			this.layoutTree
		)
		if (
			this.stdout.isTTY &&
			(this.isFirstRender || this.lastOutputHeight >= (this.stdout.rows ?? 24))
		) {
			this.stdout.write(ansiEscapes.clearTerminal + output)
			this.lastOutput = output
			this.lastOutputHeight = outputHeight
			this.log.sync(output)
			this.isFirstRender = false
			return
		}
		if (output !== this.lastOutput) this.log(output)
		this.lastOutput = output
		this.lastOutputHeight = outputHeight
	}

	writeToStdout(data: string): void {
		if (this.isUnmounted) return
		this.log.clear()
		this.stdout.write(data)
		const { output, outputHeight } = coreRenderer(
			this.rootEl,
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
		const { output } = coreRenderer(
			this.rootEl,
			this.isScreenReaderEnabled,
			this.layoutTree
		)
		this.log(output)
		this.lastOutput = output
	}

	//#region Focus Management
	private addFocusable = (id: string, opts: { autoFocus: boolean }): void => {
		this.focusables.push({ id, isActive: true })
		if (opts.autoFocus && get(this.activeFocusId) === undefined) {
			this.activeFocusId.set(id)
		}
	}

	private removeFocusable = (id: string): void => {
		this.focusables = this.focusables.filter((f) => f.id !== id)
		if (get(this.activeFocusId) === id) this.activeFocusId.set(undefined)
	}

	private activateFocusable = (id: string): void => {
		const f = this.focusables.find((f) => f.id === id)
		if (f) f.isActive = true
	}

	private deactivateFocusable = (id: string): void => {
		const f = this.focusables.find((f) => f.id === id)
		if (f) {
			f.isActive = false
			if (get(this.activeFocusId) === id) this.focusNextInternal()
		}
	}

	private focusNextInternal = (): void => {
		const active = this.focusables.filter((f) => f.isActive)
		if (!active.length) return
		const cur = active.findIndex((f) => f.id === get(this.activeFocusId))
		this.activeFocusId.set(
			active[cur === -1 || cur >= active.length - 1 ? 0 : cur + 1]!.id
		)
	}

	private focusPreviousInternal = (): void => {
		const active = this.focusables.filter((f) => f.isActive)
		if (!active.length) return
		const cur = active.findIndex((f) => f.id === get(this.activeFocusId))
		this.activeFocusId.set(active[cur <= 0 ? active.length - 1 : cur - 1]!.id)
	}

	private focusDirect = (id: string): void => {
		if (this.focusables.find((f) => f.id === id && f.isActive)) {
			this.activeFocusId.set(id)
		}
	}

	private enableFocus = (): void => {
		this.isFocusEnabled = true
	}
	private disableFocus = (): void => {
		this.isFocusEnabled = false
	}

	private handleFocusInput = (input: string): void => {
		if (input === '\u001B') {
			this.activeFocusId.set(undefined)
			return
		}
		if (!this.isFocusEnabled || !this.focusables.length) return
		if (input === '\t') this.focusNextInternal()
		if (input === '\u001B[Z') this.focusPreviousInternal()
	}
	//#endregion Focus Management

	render(App: Component): void {
		// WHY: Install DOM bridge BEFORE any Svelte code runs.
		// mount() calls document.createElement immediately — bridge must be ready.
		this.uninstallDoc = installDocument({
			getLayoutTree: () => this.layoutTree,
			getScheduleRender: () => this.scheduleRender,
		})

		// WHY: WolfieElement wrapper needed because Svelte calls target.appendChild()
		// on the root node — must go through our DOM bridge, not raw DOMElement.
		const rootWolfieEl = new WolfieElement(this.rootEl, {
			getLayoutTree: () => this.layoutTree,
			getScheduleRender: () => this.scheduleRender,
		})

		let rawModeRefCount = 0
		const context = new Map<symbol, unknown>([
			[
				STDIN_KEY,
				{
					stdin: this.stdin,
					setRawMode: (value: boolean) => {
						if (!this.stdin.isTTY) return
						if (value) {
							rawModeRefCount++
							if (rawModeRefCount === 1) this.stdin.setRawMode(true)
						} else {
							rawModeRefCount = Math.max(0, rawModeRefCount - 1)
							if (rawModeRefCount === 0) this.stdin.setRawMode(false)
						}
					},
					isRawModeSupported: this.stdin.isTTY ?? false,
					internal_exitOnCtrlC: true,
					internal_eventEmitter: this.eventEmitter,
				},
			],
			[
				STDOUT_KEY,
				{ stdout: this.stdout, write: (d: string) => this.writeToStdout(d) },
			],
			[
				STDERR_KEY,
				{ stderr: this.stderr, write: (d: string) => this.writeToStderr(d) },
			],
			[
				APP_KEY,
				{
					exit: (error?: Error) => {
						if (error) this.stderr.write(error.stack ?? error.message)
						this.unmount()
						process.exit(error ? 1 : 0)
					},
				},
			],
			[
				FOCUS_KEY,
				{
					activeFocusId: { subscribe: this.activeFocusId.subscribe },
					add: this.addFocusable,
					remove: this.removeFocusable,
					activate: this.activateFocusable,
					deactivate: this.deactivateFocusable,
					focusNext: this.focusNextInternal,
					focusPrevious: this.focusPreviousInternal,
					focus: this.focusDirect,
					enableFocus: this.enableFocus,
					disableFocus: this.disableFocus,
				},
			],
			[
				ACCESSIBILITY_KEY,
				{ isScreenReaderEnabled: this.isScreenReaderEnabled },
			],
			[THEME_KEY, this.theme],
		])

		this.mounted = mount(App, {
			target: rootWolfieEl as unknown as Document,
			context,
		})

		this.flushRender()
	}

	unmount(): void {
		if (this.isUnmounted) return
		this.isUnmounted = true
		if (this.mounted) unmount(this.mounted)
		this.uninstallDoc?.()
		this.unsubscribeResize?.()
		this.log.done()
	}
}
//#endregion WolfieSvelte

//#region Public API
export const render = (component: Component, options?: RenderOptions) => {
	const instance = new WolfieSvelte(options)
	instance.render(component)
	return instance
}
//#endregion Public API

//#region Re-exports
export {
	registerStyles,
	registerTailwindMetadata,
	clearGlobalStyles,
	getGlobalStyle,
	resolveClassName,
} from './styles'
export type { ClassNameValue } from './styles'
export { extendTheme, defaultTheme, useComponentTheme } from './theme'
export type { ITheme, IComponentTheme } from './theme'
export * from './components'
export * from './composables'
//#endregion Re-exports
