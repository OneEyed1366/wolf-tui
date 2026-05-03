import {
	defineComponent,
	ref,
	shallowRef,
	markRaw,
	computed,
	watchEffect,
	watch,
	cloneVNode,
	toRef,
	onMounted,
	onUpdated,
	onUnmounted,
	nextTick,
	type PropType,
} from 'vue'
import { measureElement, type DOMElement, type Styles } from '@wolf-tui/core'
import {
	clampScrollOffset,
	getBottomOffset,
	type ClassNameValue,
} from '@wolf-tui/shared'
import { useInput } from '../composables/use-input'

//#region Types
export interface IScrollViewProps {
	/**
	 * Viewport height in rows. Required — the visible window that clips overflow.
	 */
	height: number
	/**
	 * Controlled scroll offset. If provided, the parent owns state and must
	 * sync via `onScroll`. If omitted, ScrollView manages its own offset.
	 */
	offset?: number
	/**
	 * When true (default), the component wires arrow keys, PageUp/PageDown,
	 * Home, and End to the scroll offset. Disable to handle input externally.
	 *
	 * @default true
	 */
	keyBindings?: boolean
	/**
	 * Called whenever the offset changes (user input OR imperative methods).
	 */
	onScroll?: (offset: number) => void
	/**
	 * Called whenever the measured content height changes.
	 */
	onContentHeightChange?: (height: number) => void
	/**
	 * Additional styles applied to the outer viewport box.
	 */
	style?: Styles
	/**
	 * Additional className applied to the outer viewport box.
	 */
	className?: ClassNameValue
}

export interface IScrollViewHandle {
	scrollTo: (offset: number) => void
	scrollBy: (delta: number) => void
	scrollToTop: () => void
	scrollToBottom: () => void
	getScrollOffset: () => number
	getContentHeight: () => number
	getViewportHeight: () => number
}
//#endregion Types

//#region Component
export const ScrollView = defineComponent({
	name: 'ScrollView',
	props: {
		height: {
			type: Number as PropType<number>,
			required: true,
		},
		offset: {
			type: Number as PropType<number | undefined>,
			default: undefined,
		},
		keyBindings: {
			type: Boolean,
			default: true,
		},
		onScroll: {
			type: Function as PropType<(offset: number) => void>,
			default: undefined,
		},
		onContentHeightChange: {
			type: Function as PropType<(height: number) => void>,
			default: undefined,
		},
		style: {
			type: Object as PropType<Styles>,
			default: () => ({}),
		},
		className: {
			type: [String, Object, Array] as PropType<ClassNameValue>,
			default: undefined,
		},
	},
	setup(props, { slots, expose }) {
		//#region State
		const internalOffset = ref(0)
		const contentHeight = ref(0)

		const offsetRef = toRef(props, 'offset')
		const isControlled = computed(() => offsetRef.value !== undefined)

		const currentOffset = computed(() =>
			isControlled.value ? (offsetRef.value as number) : internalOffset.value
		)

		const viewportHeight = computed(() => Math.max(0, props.height))
		//#endregion State

		//#region Commit
		// Single source of truth for updating the offset. Clamps against the
		// current metrics, writes internal state only when uncontrolled, and
		// always emits onScroll (controlled parents need it to mirror state).
		const commitOffset = (next: number): void => {
			const clamped = clampScrollOffset(next, {
				contentHeight: contentHeight.value,
				viewportHeight: viewportHeight.value,
			})
			if (!isControlled.value) {
				if (internalOffset.value !== clamped) {
					internalOffset.value = clamped
				}
			}
			if (clamped !== currentOffset.value || isControlled.value) {
				props.onScroll?.(clamped)
			}
		}
		//#endregion Commit

		//#region Measurement
		// Measure inner box via template ref. Cloning the vnode with a ref
		// callback is the same pattern ProgressBar uses — keeps us out of
		// the framework's DOM-element identity business.
		//
		// WHY nextTick + onMounted/onUpdated: Vue fires the ref callback
		// synchronously during the patch phase, BEFORE the render scheduler
		// has run `computeLayout`. First-time measurement returns 0. We stash
		// the element reference and re-measure after nextTick (once the
		// scheduled onRender has flushed). Without this, contentHeight would
		// stay 0 for the entire lifetime when no prop change triggers a
		// re-render — ScrollView has no prop that naturally advances.
		// shallowRef + markRaw: measureElement -> getLayout is a napi-rs
		// native method that requires the real LayoutTree instance as `this`.
		// A plain ref() wraps the DOMElement in a deep reactive Proxy; calling
		// native methods through the Proxy loses `this` -> "Illegal invocation".
		// shallowRef skips deep conversion of the stored value; markRaw tags
		// the object so any accidental reactive() wrapping elsewhere is a no-op.
		const innerEl = shallowRef<DOMElement | null>(null)

		const setInnerRef = (el: unknown) => {
			if (!el) {
				innerEl.value = null
				return
			}
			const domEl = markRaw(el as DOMElement)
			innerEl.value = domEl
			const dimensions = measureElement(domEl)
			if (dimensions.height !== contentHeight.value) {
				contentHeight.value = dimensions.height
			}
		}

		let pendingMeasure = false
		const scheduleMeasure = () => {
			if (pendingMeasure) return
			pendingMeasure = true
			void nextTick(() => {
				pendingMeasure = false
				const domEl = innerEl.value
				if (!domEl) return
				const dimensions = measureElement(domEl)
				if (dimensions.height !== contentHeight.value) {
					contentHeight.value = dimensions.height
				}
			})
		}

		onMounted(scheduleMeasure)
		onUpdated(scheduleMeasure)

		// Periodic fallback: if layout hasn't computed by first nextTick
		// (throttled renderer batches into maxFps), poll a few frames.
		let pollCount = 0
		let pollTimer: ReturnType<typeof setTimeout> | null = null
		const pollMeasure = () => {
			const domEl = innerEl.value
			if (domEl) {
				const dimensions = measureElement(domEl)
				if (dimensions.height !== contentHeight.value) {
					contentHeight.value = dimensions.height
				}
			}
			pollCount++
			if (pollCount < 5) {
				pollTimer = setTimeout(pollMeasure, 50)
			} else {
				pollTimer = null
			}
		}
		onMounted(() => {
			pollTimer = setTimeout(pollMeasure, 50)
		})
		onUnmounted(() => {
			if (pollTimer) {
				clearTimeout(pollTimer)
				pollTimer = null
			}
		})
		//#endregion Measurement

		//#region Content height broadcast
		watchEffect(() => {
			props.onContentHeightChange?.(contentHeight.value)
		})
		//#endregion Content height broadcast

		//#region Auto-clamp on metric changes
		// When the content shrinks below current offset (uncontrolled only),
		// pull the offset back so the viewport stays pinned to real content.
		watch([contentHeight, viewportHeight], () => {
			if (isControlled.value) return
			const clamped = clampScrollOffset(internalOffset.value, {
				contentHeight: contentHeight.value,
				viewportHeight: viewportHeight.value,
			})
			if (clamped !== internalOffset.value) {
				internalOffset.value = clamped
				props.onScroll?.(clamped)
			}
		})
		//#endregion Auto-clamp on metric changes

		//#region Keybindings
		useInput(
			(_input, key) => {
				if (key.upArrow) {
					commitOffset(currentOffset.value - 1)
					return
				}
				if (key.downArrow) {
					commitOffset(currentOffset.value + 1)
					return
				}
				if (key.pageUp) {
					commitOffset(currentOffset.value - viewportHeight.value)
					return
				}
				if (key.pageDown) {
					commitOffset(currentOffset.value + viewportHeight.value)
					return
				}
				if (key.home) {
					commitOffset(0)
					return
				}
				if (key.end) {
					commitOffset(
						getBottomOffset({
							contentHeight: contentHeight.value,
							viewportHeight: viewportHeight.value,
						})
					)
					return
				}
			},
			{ isActive: () => props.keyBindings !== false }
		)
		//#endregion Keybindings

		//#region Imperative handle
		const handle: IScrollViewHandle = {
			scrollTo: (value) => commitOffset(value),
			scrollBy: (delta) => commitOffset(currentOffset.value + delta),
			scrollToTop: () => commitOffset(0),
			scrollToBottom: () =>
				commitOffset(
					getBottomOffset({
						contentHeight: contentHeight.value,
						viewportHeight: viewportHeight.value,
					})
				),
			getScrollOffset: () => currentOffset.value,
			getContentHeight: () => contentHeight.value,
			getViewportHeight: () => viewportHeight.value,
		}
		expose(handle)
		//#endregion Imperative handle

		//#region Render
		return () => {
			const outerStyle: Styles = {
				flexDirection: 'column',
				overflow: 'hidden',
				height: viewportHeight.value,
				...(props.style ?? {}),
			}

			const innerStyle: Styles = {
				flexDirection: 'column',
				flexShrink: 0,
				marginTop: -currentOffset.value,
			}

			const innerVNode = (
				<wolfie-box style={innerStyle}>{slots.default?.()}</wolfie-box>
			)

			return (
				<wolfie-box class={props.className} style={outerStyle}>
					{cloneVNode(innerVNode, { ref: setInnerRef })}
				</wolfie-box>
			)
		}
		//#endregion Render
	},
})
//#endregion Component

export type { IScrollViewProps as Props, IScrollViewProps as ScrollViewProps }
