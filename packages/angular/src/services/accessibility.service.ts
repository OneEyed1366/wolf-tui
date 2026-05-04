import { Injectable, inject, assertInInjectionContext } from '@angular/core'
import { ACCESSIBILITY_CONTEXT } from '../tokens'

//#region AccessibilityService
@Injectable()
export class AccessibilityService {
	private context = inject(ACCESSIBILITY_CONTEXT)

	get isScreenReaderEnabled(): boolean {
		return this.context.isScreenReaderEnabled
	}
}
//#endregion AccessibilityService

//#region injectIsScreenReaderEnabled
/**
 * Returns whether a screen reader is enabled. Useful for rendering different
 * output for screen readers.
 *
 * Mirrors React/Vue/Solid/Svelte's `useIsScreenReaderEnabled`.
 *
 * @example
 * ```typescript
 * export class MyComponent {
 *   private srEnabled = injectIsScreenReaderEnabled()
 * }
 * ```
 */
export function injectIsScreenReaderEnabled(): boolean {
	assertInInjectionContext(injectIsScreenReaderEnabled)
	const ctx = inject(ACCESSIBILITY_CONTEXT, { optional: true })
	return ctx?.isScreenReaderEnabled ?? false
}
//#endregion injectIsScreenReaderEnabled
