<script lang="ts">
	import { setContext, type Component } from 'svelte'
	import {
		STDIN_CTX,
		STDOUT_CTX,
		STDERR_CTX,
		APP_CTX,
		FOCUS_CTX,
		ACCESSIBILITY_CTX,
		THEME_CTX,
	} from './context/symbols.js'
	import type { StdinContextValue, StdoutContextValue, StderrContextValue, AppContextValue, FocusContextValue, AccessibilityContextValue } from './context/types.js'
	import type { ITheme } from '@wolfie/shared'

	interface Props {
		stdinValue: StdinContextValue
		stdoutValue: StdoutContextValue
		stderrValue: StderrContextValue
		appValue: AppContextValue
		focusValue: FocusContextValue
		accessibilityValue: AccessibilityContextValue
		themeValue: ITheme
		component: Component
	}

	// Avoid destructuring $props() — setContext captures stable object refs once,
	// and Svelte warns about state_referenced_locally on destructured props.
	const props: Props = $props()
	const UserComponent = $derived(props.component)

	setContext(STDIN_CTX, props.stdinValue)
	setContext(STDOUT_CTX, props.stdoutValue)
	setContext(STDERR_CTX, props.stderrValue)
	setContext(APP_CTX, props.appValue)
	setContext(FOCUS_CTX, props.focusValue)
	setContext(ACCESSIBILITY_CTX, props.accessibilityValue)
	setContext(THEME_CTX, props.themeValue)
</script>

<UserComponent />
