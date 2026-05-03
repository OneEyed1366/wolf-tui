<!-- #region Script -->
<script lang="ts">
	import type { Styles } from '@wolf-tui/core'
	import { measureElement } from '@wolf-tui/core'
	import { clampScrollOffset } from '@wolf-tui/shared'
	import { resolveClassName } from '../styles/index.js'
	import { wolfieProps } from '../renderer/wolfie-action.js'
	import { WolfieElement } from '../renderer/wolfie-element.js'
	import { useInput } from '../composables/use-input.js'
	import type { IScrollViewProps } from './ScrollView.types.js'

	let {
		height,
		offset: controlledOffset,
		keyBindings = true,
		onScroll,
		onContentHeightChange,
		style,
		class: classProp,
		className,
		children,
	}: IScrollViewProps = $props()

	//#region State
	let internalOffset = $state(0)
	let contentHeight = $state(0)
	//#endregion State

	//#region Derived
	const isControlled = $derived(controlledOffset !== undefined)
	const rawOffset = $derived(isControlled ? (controlledOffset ?? 0) : internalOffset)
	const currentOffset = $derived(
		clampScrollOffset(rawOffset, { contentHeight, viewportHeight: height })
	)

	const outerStyle = $derived({
		...resolveClassName(classProp ?? className),
		...(style ?? {}),
		flexDirection: 'column',
		overflow: 'hidden',
		height,
	} satisfies Styles)

	const innerStyle = $derived({
		flexDirection: 'column',
		flexShrink: 0,
		marginTop: -currentOffset,
	} satisfies Styles)
	//#endregion Derived

	//#region Scroll mutations
	function applyOffset(next: number): void {
		const clamped = clampScrollOffset(next, {
			contentHeight,
			viewportHeight: height,
		})
		if (isControlled) {
			onScroll?.(clamped)
			return
		}
		if (clamped === internalOffset) return
		internalOffset = clamped
		onScroll?.(clamped)
	}
	//#endregion Scroll mutations

	//#region Exported imperative handle
	export const scrollTo = (next: number): void => {
		applyOffset(next)
	}

	export const scrollBy = (delta: number): void => {
		applyOffset(currentOffset + delta)
	}

	export const scrollToTop = (): void => {
		applyOffset(0)
	}

	export const scrollToBottom = (): void => {
		applyOffset(contentHeight)
	}

	export const getScrollOffset = (): number => currentOffset
	export const getContentHeight = (): number => contentHeight
	export const getViewportHeight = (): number => height
	//#endregion Exported imperative handle

	//#region Key bindings
	if (keyBindings) {
		useInput((_input, key) => {
			if (key.upArrow) {
				applyOffset(currentOffset - 1)
				return
			}
			if (key.downArrow) {
				applyOffset(currentOffset + 1)
				return
			}
			if (key.pageUp) {
				applyOffset(currentOffset - height)
				return
			}
			if (key.pageDown) {
				applyOffset(currentOffset + height)
				return
			}
			if (key.home) {
				applyOffset(0)
				return
			}
			if (key.end) {
				applyOffset(contentHeight)
				return
			}
		})
	}
	//#endregion Key bindings

	//#region Measure action
	// Layout is async — core schedules compute via queueMicrotask after mount.
	// measureElement() called synchronously at action-init returns 0. Defer to
	// next tick so Taffy has resolved dimensions, then subscribe to ongoing
	// changes by re-measuring on each `update()` (Svelte calls update when the
	// parameter object changes — we pass a reactive dep object so it fires).
	function measureInner(
		node: WolfieElement,
		_dep: { offset: number; height: number }
	) {
		const remeasure = () => {
			if (!node?.domElement) return
			const dims = measureElement(node.domElement)
			if (dims.height !== contentHeight) {
				contentHeight = dims.height
				onContentHeightChange?.(dims.height)
			}
		}
		queueMicrotask(remeasure)
		return {
			update(_nextDep: { offset: number; height: number }) {
				queueMicrotask(remeasure)
			},
			destroy() {},
		}
	}
	//#endregion Measure action
</script>
<!-- #endregion Script -->

<!-- #region Template -->
<wolfie-box use:wolfieProps={{ style: outerStyle }}>
	<wolfie-box
		use:wolfieProps={{ style: innerStyle }}
		use:measureInner={{ offset: currentOffset, height }}
	>
		{#if children}
			{@render children()}
		{/if}
	</wolfie-box>
</wolfie-box>
<!-- #endregion Template -->
