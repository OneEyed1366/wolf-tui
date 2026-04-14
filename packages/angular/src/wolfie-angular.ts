import { EventEmitter } from 'node:events'
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

//#region Types
export interface WolfieOptions {
	stdout?: NodeJS.WriteStream
	stdin?: NodeJS.ReadStream
	stderr?: NodeJS.WriteStream
	maxFps?: number
	debug?: boolean
	isScreenReaderEnabled?: boolean
	exitOnCtrlC?: boolean
	incrementalRendering?: boolean
}

export type WolfieAngularInstance = {
	layoutTree: LayoutTree
}
//#endregion Types

//#region Registry
/** WeakMap to associate root nodes with their WolfieAngular instances */
export const layoutTreeRegistry = new WeakMap<
	DOMElement,
	WolfieAngularInstance
>()
//#endregion Registry

//#region WolfieAngular Class
export class WolfieAngular {
	public readonly rootNode: DOMElement
	public readonly stdout: NodeJS.WriteStream
	public readonly stdin: NodeJS.ReadStream
	public readonly stderr: NodeJS.WriteStream
	public readonly layoutTree: LayoutTree
	public readonly eventEmitter: EventEmitter
	public readonly isScreenReaderEnabled: boolean
	public readonly exitOnCtrlC: boolean
	public readonly onRender: () => void
	private flushRender!: () => void

	private log: LogUpdate
	private isUnmounted = false
	private lastTerminalWidth: number
	private unsubscribeResize?: () => void
	private exitPromise: Promise<void>
	private resolveExit!: () => void
	private rawModeRefCount = 0

	constructor(options: WolfieOptions = {}) {
		this.stdout = options.stdout || process.stdout
		this.stdin = options.stdin || process.stdin
		this.stderr = options.stderr || process.stderr
		this.exitOnCtrlC = options.exitOnCtrlC ?? true

		const rawLayoutTree = new TaffyLayoutTree()
		// WHY: LoggedLayoutTree is only constructed when logging is enabled
		this.layoutTree = logger.enabled
			? new LoggedLayoutTree(rawLayoutTree, logger)
			: rawLayoutTree
		this.rootNode = createNode('wolfie-root' as ElementNames, this.layoutTree)

		this.log = logUpdate.create(this.stdout, {
			incremental: options.incrementalRendering ?? true,
		})
		this.eventEmitter = new EventEmitter()
		this.lastTerminalWidth = this.getTerminalWidth()

		this.isScreenReaderEnabled =
			options.isScreenReaderEnabled ??
			process.env['INK_SCREEN_READER'] === 'true'

		// Create exit promise
		this.exitPromise = new Promise<void>((resolve) => {
			this.resolveExit = resolve
		})

		// In debug mode or screen reader mode, disable throttling for synchronous rendering
		const unthrottled = options.debug === true || this.isScreenReaderEnabled
		const maxFps = options.maxFps ?? 30
		const renderThrottleMs =
			unthrottled || maxFps <= 0 ? 0 : Math.max(1, Math.ceil(1000 / maxFps))

		const renderFn = this._onRender.bind(this)
		const throttledRender =
			renderThrottleMs > 0
				? throttle(renderFn, renderThrottleMs, {
						leading: true,
						trailing: true,
					})
				: renderFn

		const { scheduleRender, flush } = createRenderScheduler(throttledRender, {
			sync: unthrottled,
		})
		this.flushRender = flush

		this.rootNode.onRender = scheduleRender
		this.onRender = scheduleRender

		layoutTreeRegistry.set(this.rootNode, {
			layoutTree: this.layoutTree,
		})

		// Set default style for root node to match React/Vue behavior
		this.rootNode.style = {
			flexDirection: 'column',
			alignItems: 'stretch',
		}

		// Set up stdin data listener
		this.stdin.on('data', (data: Buffer) => {
			const input = data.toString()
			if (input === '\x03' && this.exitOnCtrlC) {
				this.unmount()
				process.exit(0)
			}
			this.eventEmitter.emit('input', input)
		})

		// Set up resize listener if TTY
		if (this.stdout.isTTY) {
			this.stdout.on('resize', this.resized)
			this.unsubscribeResize = () => {
				this.stdout.off('resize', this.resized)
			}
		}

		// Register signal-exit cleanup
		signalExit(() => this.unmount())
	}

	//#region Terminal Dimensions
	getTerminalWidth = (): number => {
		return this.stdout.columns || 80
	}

	getTerminalHeight = (): number => {
		return this.stdout.rows || 24
	}

	resized = (): void => {
		const currentWidth = this.getTerminalWidth()

		if (currentWidth < this.lastTerminalWidth) {
			this.log.clear()
		}

		this.calculateLayout()
		this.flushRender()

		this.lastTerminalWidth = currentWidth
	}
	//#endregion Terminal Dimensions

	//#region Raw Mode Management
	setRawMode = (value: boolean): void => {
		if (this.stdin.isTTY) {
			if (value) {
				this.rawModeRefCount++
				if (this.rawModeRefCount === 1) {
					this.stdin.setRawMode(true)
				}
			} else {
				this.rawModeRefCount = Math.max(0, this.rawModeRefCount - 1)
				if (this.rawModeRefCount === 0) {
					this.stdin.setRawMode(false)
				}
			}
		}
	}

	get isRawModeSupported(): boolean {
		return this.stdin.isTTY
	}
	//#endregion Raw Mode Management

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
		const terminalHeight = this.getTerminalHeight()

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

	calculateLayout = (): void => {
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
	private _onRender(): void {
		if (this.isUnmounted) return

		this.calculateLayout()
		const t0 = performance.now()
		if (logger.enabled) {
			logger.log({ ts: t0, cat: 'render', op: 'start' })
		}
		const { output } = coreRenderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)
		if (logger.enabled) {
			logger.log({
				ts: t0,
				cat: 'render',
				op: 'end',
				durationMs: performance.now() - t0,
			})
		}
		this.log(output)
	}
	//#endregion Rendering

	//#region Output
	writeToStdout(data: string): void {
		if (this.isUnmounted) return
		this.log.clear()
		this.stdout.write(data)
		const { output } = coreRenderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)
		this.log(output)
	}

	writeToStderr(data: string): void {
		if (this.isUnmounted) return
		this.log.clear()
		this.stderr.write(data)
		const { output } = coreRenderer(
			this.rootNode,
			this.isScreenReaderEnabled,
			this.layoutTree
		)
		this.log(output)
	}

	clear(): void {
		if (this.isUnmounted) return
		this.log.clear()
	}
	//#endregion Output

	//#region Lifecycle
	unmount(): void {
		if (this.isUnmounted) return
		this.isUnmounted = true

		if (this.unsubscribeResize) {
			this.unsubscribeResize()
		}

		// Restore raw mode if it was set
		if (this.rawModeRefCount > 0 && this.stdin.isTTY) {
			this.stdin.setRawMode(false)
		}

		this.log.done()
		this.resolveExit()
	}

	waitUntilExit(): Promise<void> {
		return this.exitPromise
	}

	exit(error?: Error): void {
		if (error) {
			this.stderr.write(error.stack || error.message)
		}
		this.unmount()
		process.exit(error ? 1 : 0)
	}
	//#endregion Lifecycle
}
//#endregion WolfieAngular Class
