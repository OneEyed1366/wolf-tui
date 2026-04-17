import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react'
import { measureElement, type DOMElement } from '@wolf-tui/core'
import { clampScrollOffset, computeBoxStyle } from '@wolf-tui/shared'
import { useInput } from '../../hooks/use-input'
import type { IScrollViewHandle, IScrollViewProps } from './types'

/**
`<ScrollView>` is a fixed-height viewport that clips its children and allows
scrolling through overflowing content. It uses a negative `marginTop` on an
inner box plus `overflow: hidden` on the outer box to scroll — no terminal
scrollback is involved.

Uncontrolled (internal state) usage:

```tsx
<ScrollView height={8}>
  {items.map((it) => <Text key={it.id}>{it.label}</Text>)}
</ScrollView>
```

Controlled usage:

```tsx
const [offset, setOffset] = useState(0)
<ScrollView height={8} offset={offset} onScroll={setOffset}>
  {...}
</ScrollView>
```

Imperative API via ref:

```tsx
const handle = useRef<IScrollViewHandle>(null)
handle.current?.scrollToBottom()
```
*/
export const ScrollView = forwardRef<IScrollViewHandle, IScrollViewProps>(
	function ScrollView(
		{
			height,
			offset: controlledOffset,
			keyBindings = true,
			onScroll,
			onContentHeightChange,
			className,
			style,
			children,
		},
		ref
	) {
		const isControlled = controlledOffset !== undefined
		const [internalOffset, setInternalOffset] = useState(0)
		const offset = isControlled ? controlledOffset : internalOffset

		const [contentHeight, setContentHeight] = useState(0)
		const [innerRef, setInnerRef] = useState<DOMElement | null>(null)

		// Measure the inner box on every render. Mirrors the measure pattern used
		// in ProgressBar (callback-ref + useState + measureElement).
		if (innerRef) {
			const dimensions = measureElement(innerRef)
			if (dimensions.height !== contentHeight) {
				setContentHeight(dimensions.height)
			}
		}

		// Notify parent when the measured content height changes.
		useEffect(() => {
			onContentHeightChange?.(contentHeight)
		}, [contentHeight, onContentHeightChange])

		// Stable setter that handles both controlled and uncontrolled modes and
		// always clamps against the current metrics.
		const applyOffset = useCallback(
			(next: number) => {
				const clamped = clampScrollOffset(next, {
					contentHeight,
					viewportHeight: height,
				})
				if (!isControlled) {
					setInternalOffset((prev) => (prev === clamped ? prev : clamped))
				}
				if (clamped !== offset) {
					onScroll?.(clamped)
				}
			},
			[contentHeight, height, isControlled, offset, onScroll]
		)

		// Imperative handle: scrollTo/By/Top/Bottom + getters.
		useImperativeHandle(
			ref,
			() => ({
				scrollTo: (next) => applyOffset(next),
				scrollBy: (delta) => applyOffset(offset + delta),
				scrollToTop: () => applyOffset(0),
				scrollToBottom: () => applyOffset(Number.MAX_SAFE_INTEGER),
				getScrollOffset: () => offset,
				getContentHeight: () => contentHeight,
				getViewportHeight: () => height,
			}),
			[applyOffset, offset, contentHeight, height]
		)

		// Built-in key bindings: arrows (1 row), PageUp/PageDown (viewport),
		// Home/End (extremes). All captured closure values appear in the effect
		// deps inside useInput — `applyOffset` + `offset` + `height`.
		useInput(
			(_input, key) => {
				if (key.upArrow) {
					applyOffset(offset - 1)
					return
				}
				if (key.downArrow) {
					applyOffset(offset + 1)
					return
				}
				if (key.pageUp) {
					applyOffset(offset - height)
					return
				}
				if (key.pageDown) {
					applyOffset(offset + height)
					return
				}
				if (key.home) {
					applyOffset(0)
					return
				}
				if (key.end) {
					applyOffset(Number.MAX_SAFE_INTEGER)
				}
			},
			{ isActive: keyBindings }
		)

		// Merge caller style/className via the shared compute helper, then force
		// the fixed-height clipping viewport invariants on top.
		const viewportStyle = {
			...computeBoxStyle({ className, style }),
			height,
			overflow: 'hidden' as const,
			overflowX: 'hidden' as const,
			overflowY: 'hidden' as const,
			flexDirection: 'column' as const,
		}

		return (
			<wolfie-box style={viewportStyle}>
				<wolfie-box
					ref={setInnerRef}
					style={{
						flexDirection: 'column',
						flexShrink: 0,
						marginTop: -offset,
					}}
				>
					{children}
				</wolfie-box>
			</wolfie-box>
		)
	}
)

ScrollView.displayName = 'ScrollView'

export type { IScrollViewProps, IScrollViewHandle } from './types'
