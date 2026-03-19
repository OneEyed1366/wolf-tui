<script lang="ts">
	import { setContext, getContext, type Snippet } from 'svelte'
	import type { Styles } from '@wolfie/core'
	import { resolveClassName, type ClassNameValue } from '../styles/index.js'
	import { wolfieProps } from '../renderer/wolfie-action.js'
	import { ACCESSIBILITY_CTX, BACKGROUND_CTX } from '../context/symbols.js'
	import type { AccessibilityContextValue } from '../context/types.js'

	//#region Types
	type AriaRole =
		| 'button'
		| 'checkbox'
		| 'combobox'
		| 'list'
		| 'listbox'
		| 'listitem'
		| 'menu'
		| 'menuitem'
		| 'option'
		| 'progressbar'
		| 'radio'
		| 'radiogroup'
		| 'tab'
		| 'tablist'
		| 'table'
		| 'textbox'
		| 'timer'
		| 'toolbar'

	type AriaState = {
		busy?: boolean
		checked?: boolean
		disabled?: boolean
		expanded?: boolean
		multiline?: boolean
		multiselectable?: boolean
		readonly?: boolean
		required?: boolean
		selected?: boolean
	}
	//#endregion Types

	let {
		style,
		class: classProp,
		className,
		children,
		'aria-label': ariaLabel,
		'aria-hidden': ariaHidden,
		'aria-role': ariaRole,
		'aria-state': ariaState,
	}: {
		style?: Styles
		class?: ClassNameValue
		className?: ClassNameValue
		children?: Snippet
		'aria-label'?: string
		'aria-hidden'?: boolean
		'aria-role'?: AriaRole
		'aria-state'?: AriaState
	} = $props()

	//#region Default Styles
	const defaultBoxStyles: Partial<Styles> = {
		flexWrap: 'nowrap',
		flexDirection: 'row',
		flexGrow: 0,
		flexShrink: 1,
	}
	//#endregion Default Styles

	const accessibility = getContext<AccessibilityContextValue | undefined>(ACCESSIBILITY_CTX)
	const inheritedBg = getContext<(() => string | undefined) | undefined>(BACKGROUND_CTX)

	let resolvedStyle = $derived({
		...defaultBoxStyles,
		...resolveClassName(classProp ?? className),
		...(style ?? {}),
	})

	let bgColor = $derived(resolvedStyle.backgroundColor ?? inheritedBg?.())

	let fullStyle = $derived({
		backgroundColor: bgColor,
		overflowX: resolvedStyle.overflowX ?? resolvedStyle.overflow ?? 'visible',
		overflowY: resolvedStyle.overflowY ?? resolvedStyle.overflow ?? 'visible',
		...defaultBoxStyles,
		...resolvedStyle,
	} satisfies Styles)

	let isHidden = $derived(accessibility?.isScreenReaderEnabled && ariaHidden)

	// Propagate background color to children via context
	setContext(BACKGROUND_CTX, () => bgColor)
</script>

{#if !isHidden}
	<wolfie-box
		use:wolfieProps={{ style: fullStyle }}
		internal_accessibility={{ role: ariaRole, state: ariaState }}
	>
		{#if accessibility?.isScreenReaderEnabled && ariaLabel}
			<wolfie-text>{ariaLabel}</wolfie-text>
		{:else if children}
			{@render children()}
		{/if}
	</wolfie-box>
{/if}
