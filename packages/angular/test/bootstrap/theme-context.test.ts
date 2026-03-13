import {
	createEnvironmentInjector,
	runInInjectionContext,
	ElementRef,
	type EnvironmentInjector,
} from '@angular/core'
import { describe, it, expect } from 'vitest'
import { AlertComponent } from '../../src/components/alert/alert.component'
import { BadgeComponent } from '../../src/components/badge/badge.component'
import { ProgressBarComponent } from '../../src/components/progress-bar/progress-bar.component'
import { THEME_CONTEXT, defaultTheme } from '../../src/theme'

//#region Helpers

/**
 * Mirrors what renderWolfie does:
 * createEnvironmentInjector(providers, null as EnvironmentInjector).
 *
 * With a null parent there is no real ApplicationRef in the injector chain,
 * so tokens declared with `providedIn: 'root'` cannot be resolved automatically —
 * they MUST be listed explicitly in the providers array.
 *
 * Pass `includeTheme: true` to model the fixed renderWolfie behaviour.
 */
function createWolfieStyleInjector(includeTheme: boolean): EnvironmentInjector {
	return createEnvironmentInjector(
		includeTheme ? [{ provide: THEME_CONTEXT, useValue: defaultTheme }] : [],
		null as unknown as EnvironmentInjector
	)
}

//#endregion

describe('renderWolfie — THEME_CONTEXT provision', () => {
	// -------------------------------------------------------------------------
	// Regression: ProgressBarComponent calls inject(THEME_CONTEXT) in its body.
	// renderWolfie used to create a null-parent injector without listing
	// THEME_CONTEXT explicitly, so Angular's providedIn:'root' resolution failed
	// — NullInjectorError: No provider for InjectionToken WolfieTheme.
	//
	// Note: AlertComponent and BadgeComponent were migrated to WNode render
	// functions and no longer inject THEME_CONTEXT — they instantiate without it.
	// -------------------------------------------------------------------------

	it('AlertComponent — instantiates without THEME_CONTEXT (uses shared render fn)', () => {
		const injector = createWolfieStyleInjector(/* includeTheme: */ false)
		expect(() =>
			runInInjectionContext(injector, () => new AlertComponent())
		).not.toThrow()
	})

	it('BadgeComponent — instantiates without THEME_CONTEXT (uses shared render fn)', () => {
		const injector = createWolfieStyleInjector(/* includeTheme: */ false)
		expect(() =>
			runInInjectionContext(injector, () => new BadgeComponent())
		).not.toThrow()
	})

	it('ProgressBarComponent — instantiates in null-parent injector when THEME_CONTEXT is provided', () => {
		// WHY: ProgressBarComponent also injects ElementRef (reads the host element's
		// attributes for width). Provide a minimal mock, same as box.contract.test.ts.
		const injector = createEnvironmentInjector(
			[
				{ provide: THEME_CONTEXT, useValue: defaultTheme },
				{
					provide: ElementRef,
					useValue: { nativeElement: { attributes: {} } },
				},
			],
			null as unknown as EnvironmentInjector
		)
		expect(() =>
			runInInjectionContext(injector, () => new ProgressBarComponent())
		).not.toThrow()
	})

	it('user-supplied THEME_CONTEXT via options.providers overrides default', () => {
		// WHY: renderWolfie adds defaultTheme first, then spreads options.providers.
		// In Angular's R3Injector, later declarations override earlier ones
		// → user can customise the theme via options.providers.
		const customTheme = { ...defaultTheme }
		const injector = createEnvironmentInjector(
			[
				{ provide: THEME_CONTEXT, useValue: defaultTheme },
				{ provide: THEME_CONTEXT, useValue: customTheme }, // user override
			],
			null as unknown as EnvironmentInjector
		)
		expect(injector.get(THEME_CONTEXT)).toBe(customTheme)
	})
})
