import {
	createRenderer,
	ref,
	nextTick,
	type App,
	type Component,
	type Ref,
} from 'vue'
import { EventEmitter } from 'node:events'
import ansiEscapes from 'ansi-escapes'
import { nodeOps } from './renderer/nodeOps'
import { patchProp } from './renderer/patchProp'
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
	type DOMNode,
	LoggedLayoutTree,
	logger,
} from '@wolf-tui/core'
import { LayoutTree as TaffyLayoutTree } from '@wolf-tui/core/layout'
import { throttle } from 'es-toolkit/compat'
import { createRenderScheduler } from '@wolf-tui/shared'
import signalExit from 'signal-exit'
import {
	StdinSymbol,
	StdoutSymbol,
	StderrSymbol,
	AppSymbol,
	AccessibilitySymbol,
	FocusSymbol,
} from './context/symbols'
// Note: CSS compilation moved to @wolf-tui/plugin

// Lazy initialization
let _createApp:
	| ReturnType<typeof createRenderer<DOMNode, DOMElement>>['createApp']
	| null = null
const getCreateApp = () => {
	if (!_createApp) {
		const renderer = createRenderer<DOMNode, DOMElement>({
			...nodeOps,
			patchProp,
		})
		_createApp = renderer.createApp
	}
	return _createApp
}

export interface RenderOptions {
	stdout?: NodeJS.WriteStream
	stdin?: NodeJS.ReadStream
	stderr?: NodeJS.WriteStream
	maxFps?: number
	/**
	 * Configure whether Wolfie should listen for Ctrl+C keyboard input and
	 * exit the app. Needed because stdin is in raw mode, so Ctrl+C is
	 * ignored by default and must be handled manually.
	 *
	 * @default true
	 */
	exitOnCtrlC?: boolean
	/**
	 * Enable debug mode (disables throttling for synchronous testing)
	 */
	debug?: boolean
	/**
	 * Enable screen reader mode. When enabled, the renderer outputs
	 * plain text optimized for screen readers without ANSI styles.
	 *
	 * @default process.env['INK_SCREEN_READER'] === 'true'
	 */
	isScreenReaderEnabled?: boolean
	incrementalRendering?: boolean
}

export type WolfieVueInstance = {
	layoutTree: LayoutTree
}

export const layoutTreeRegistry = new WeakMap<DOMElement, WolfieVueInstance>()

interface Focusable {
	id: string
	isActive: boolean
}

class WolfieVue {
	private rootNode: DOMElement
	private app!: App<DOMNode>
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
	private isScreenReaderEnabled!: boolean
	private scheduleRender!: () => void
	private flushRender!: () => void

	//#region Focus State
	private focusables: Ref<Focusable[]> = ref([])
	private activeFocusId: Ref<string | undefined> = ref(undefined)
	private isFocusEnabled = true
	//#endregion Focus State

	private exitOnCtrlC: boolean

	constructor(options: RenderOptions = {}) {
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

		// In debug mode or screen reader mode, disable throttling for synchronous rendering
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
			queueFn: (cb) => {
				nextTick(cb)
			},
		})
		this.scheduleRender = scheduleRender
		this.flushRender = flush

		this.rootNode.onRender = scheduleRender

		layoutTreeRegistry.set(this.rootNode, {
			layoutTree: this.layoutTree,
		})

		// Set default style for root node to match React behavior
		// flexDirection: 'column' makes the main axis vertical, so alignItems: 'stretch'
		// stretches children horizontally (along the cross-axis = width)
		// NOTE: Do NOT set width here - it's set dynamically in calculateLayout
		this.rootNode.style = {
			flexDirection: 'column',
			alignItems: 'stretch',
		}

		this.stdin.on('data', (data: Buffer) => {
			const input = data.toString()
			if (input === '\x03' && this.exitOnCtrlC) {
				this.unmount()
				process.exit(0)
			}
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
		const t0 = performance.now()
		if (logger.enabled) {
			logger.log({ ts: t0, cat: 'render', op: 'start' })
		}
		const { output, outputHeight } = coreRenderer(
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
				outputChanged: output !== this.lastOutput,
				outputHeight,
			})
		}

		// Clear terminal on first render or when output fills the screen
		// This clears any pre-existing console output (e.g., build logs)
		// Only do this in TTY mode to avoid breaking tests
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
		this.focusables.value.push({ id, isActive: true })

		// Auto-focus if requested and no component is currently focused
		if (options.autoFocus && this.activeFocusId.value === undefined) {
			this.activeFocusId.value = id
		}
	}

	private removeFocusable = (id: string) => {
		this.focusables.value = this.focusables.value.filter((f) => f.id !== id)

		// Clear focus if the removed component was focused
		if (this.activeFocusId.value === id) {
			this.activeFocusId.value = undefined
		}
	}

	private activateFocusable = (id: string) => {
		const focusable = this.focusables.value.find((f) => f.id === id)
		if (focusable) {
			focusable.isActive = true
		}
	}

	private deactivateFocusable = (id: string) => {
		const focusable = this.focusables.value.find((f) => f.id === id)
		if (focusable) {
			focusable.isActive = false

			// If this was focused, advance to next (like Angular)
			if (this.activeFocusId.value === id) {
				this.focusNext()
			}
		}
	}

	private focusNext = () => {
		const activeFocusables = this.focusables.value.filter((f) => f.isActive)
		if (activeFocusables.length === 0) return

		const currentIndex = activeFocusables.findIndex(
			(f) => f.id === this.activeFocusId.value
		)

		// Wrap around: if at end or not found, go to first
		const nextIndex =
			currentIndex === -1 || currentIndex >= activeFocusables.length - 1
				? 0
				: currentIndex + 1

		this.activeFocusId.value = activeFocusables[nextIndex].id
	}

	private focusPrevious = () => {
		const activeFocusables = this.focusables.value.filter((f) => f.isActive)
		if (activeFocusables.length === 0) return

		const currentIndex = activeFocusables.findIndex(
			(f) => f.id === this.activeFocusId.value
		)

		// Wrap around: if at start or not found, go to last
		const prevIndex =
			currentIndex <= 0 ? activeFocusables.length - 1 : currentIndex - 1

		this.activeFocusId.value = activeFocusables[prevIndex].id
	}

	private focus = (id: string) => {
		const focusable = this.focusables.value.find(
			(f) => f.id === id && f.isActive
		)
		if (focusable) {
			this.activeFocusId.value = id
		}
	}

	private enableFocus = () => {
		this.isFocusEnabled = true
	}

	private disableFocus = () => {
		this.isFocusEnabled = false
	}

	private handleFocusInput = (input: string) => {
		// Escape clears focus
		if (input === '\u001B') {
			this.activeFocusId.value = undefined
			return
		}

		if (!this.isFocusEnabled || this.focusables.value.length === 0) return

		// Tab = focusNext
		if (input === '\t') {
			this.focusNext()
		}

		// Shift+Tab = focusPrevious
		if (input === '\u001B[Z') {
			this.focusPrevious()
		}
	}
	//#endregion Focus Management

	render(component: Component) {
		this.app = getCreateApp()(component)

		// Framework-level render trigger (like Angular's RendererFactory2.end()
		// and React's resetAfterCommit)
		const scheduleRender = this.scheduleRender
		this.app.mixin({
			updated() {
				scheduleRender()
			},
		})

		// Reference count for raw mode - only disable when all consumers release
		let rawModeRefCount = 0

		// Provide context values BEFORE mounting - Vue requires this
		this.app.provide(StdinSymbol, {
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
			isRawModeSupported: this.stdin.isTTY,
			internal_exitOnCtrlC: this.exitOnCtrlC,
			internal_eventEmitter: this.eventEmitter,
		})

		this.app.provide(StdoutSymbol, {
			stdout: this.stdout,
			write: (data: string) => this.writeToStdout(data),
		})

		this.app.provide(StderrSymbol, {
			stderr: this.stderr,
			write: (data: string) => this.writeToStderr(data),
		})

		this.app.provide(AppSymbol, {
			exit: (error?: Error) => {
				if (error) {
					this.stderr.write(error.stack || error.message)
				}
				this.unmount()
				process.exit(error ? 1 : 0)
			},
		})

		this.app.provide(AccessibilitySymbol, {
			isScreenReaderEnabled: this.isScreenReaderEnabled,
		})

		this.app.provide(FocusSymbol, {
			activeFocusId: this.activeFocusId,
			add: this.addFocusable,
			remove: this.removeFocusable,
			activate: this.activateFocusable,
			deactivate: this.deactivateFocusable,
			focusNext: this.focusNext,
			focusPrevious: this.focusPrevious,
			focus: this.focus,
			enableFocus: this.enableFocus,
			disableFocus: this.disableFocus,
		})

		const { mount } = this.app
		this.app.mount = (container: DOMElement) => {
			const proxy = mount(container)
			this.flushRender()
			return proxy
		}

		this.app.mount(this.rootNode)
	}

	unmount() {
		if (this.isUnmounted) return
		this.isUnmounted = true
		if (this.app) {
			this.app.unmount()
		}

		if (this.unsubscribeResize) {
			this.unsubscribeResize()
		}

		this.log.done()
	}
}

export const render = (component: Component, options?: RenderOptions) => {
	const instance = new WolfieVue(options)
	instance.render(component)
	return instance
}

export {
	registerStyles,
	registerTailwindMetadata,
	clearGlobalStyles,
	getGlobalStyle,
	resolveClassName,
} from './styles'

export type { ClassNameValue } from './styles'

// Re-export theme utilities
export {
	provideTheme,
	extendTheme,
	defaultTheme,
	useComponentTheme,
	type ITheme,
	type IComponentTheme,
	type IComponentStyles,
} from './theme'

// Re-export components
export * from './components'

// Re-export composables
export { useApp } from './composables/use-app'
export { useInput } from './composables/use-input'
export { useFocus } from './composables/use-focus'
export { useFocusManager } from './composables/use-focus-manager'
export { useStdin } from './composables/use-stdin'
export { useStdout } from './composables/use-stdout'
export { useStderr } from './composables/use-stderr'

// Re-export Vue APIs
export {
	ref,
	reactive,
	computed,
	watch,
	watchEffect,
	onMounted,
	onUnmounted,
	onBeforeMount,
	onBeforeUnmount,
	onUpdated,
	onBeforeUpdate,
	getCurrentInstance,
	provide,
	inject,
	nextTick,
	toRef,
	toRefs,
	toRaw,
	unref,
	isRef,
	isReactive,
	isReadonly,
	shallowRef,
	shallowReactive,
	shallowReadonly,
	triggerRef,
	customRef,
	markRaw,
	effectScope,
	getCurrentScope,
	onScopeDispose,
	defineComponent,
	h,
	// Template compilation helpers (needed for Vue SFC compiled templates)
	openBlock,
	createBlock,
	createElementBlock,
	createElementVNode,
	createVNode,
	createTextVNode,
	createCommentVNode,
	createStaticVNode,
	Fragment,
	Teleport,
	Suspense,
	KeepAlive,
	Transition,
	TransitionGroup,
	resolveComponent,
	resolveDirective,
	resolveDynamicComponent,
	withDirectives,
	withModifiers,
	withKeys,
	withCtx,
	renderList,
	renderSlot,
	toDisplayString,
	toHandlers,
	normalizeClass,
	normalizeStyle,
	normalizeProps,
	guardReactiveProps,
	mergeProps,
	cloneVNode,
	isVNode,
	vShow,
	vModelText,
	vModelCheckbox,
	vModelRadio,
	vModelSelect,
	vModelDynamic,
	useCssVars,
	useCssModule,
	useSlots,
	useAttrs,
	// SSR helpers (sometimes used in templates)
	ssrContextKey,
	useSSRContext,
} from 'vue'
