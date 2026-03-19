<script lang="ts">
	import { getContext, type Snippet } from 'svelte'
	import chalk from 'chalk'
	import { colorize, type Styles } from '@wolfie/core'
	import { resolveClassName, type ClassNameValue } from '../styles/index.js'
	import { wolfieProps } from '../renderer/wolfie-action.js'
	import { ACCESSIBILITY_CTX, BACKGROUND_CTX } from '../context/symbols.js'
	import type { AccessibilityContextValue } from '../context/types.js'

	let {
		style,
		class: classProp,
		className,
		children,
		'aria-label': ariaLabel,
		'aria-hidden': ariaHidden,
	}: {
		style?: Styles
		class?: ClassNameValue
		className?: ClassNameValue
		children?: Snippet
		'aria-label'?: string
		'aria-hidden'?: boolean
	} = $props()

	const accessibility = getContext<AccessibilityContextValue | undefined>(ACCESSIBILITY_CTX)
	const inheritedBg = getContext<(() => string | undefined) | undefined>(BACKGROUND_CTX)

	let effectiveStyles = $derived({
		...resolveClassName(classProp ?? className),
		...(style ?? {}),
	} satisfies Styles)

	let effectiveWrap = $derived(effectiveStyles.textWrap ?? 'wrap')

	// Build the text transform function from current style props
	let transform = $derived.by((): ((text: string) => string) => {
		const effectiveColor = effectiveStyles.color
		const effectiveBackgroundColor = effectiveStyles.backgroundColor
		const effectiveBold = effectiveStyles.fontWeight === 'bold'
		const effectiveItalic = effectiveStyles.fontStyle === 'italic'
		const effectiveUnderline = effectiveStyles.textDecoration === 'underline'
		const effectiveStrikethrough = effectiveStyles.textDecoration === 'line-through'
		const effectiveInverse = effectiveStyles.inverse ?? false

		return (text: string): string => {
			let result = text

			if (effectiveColor) {
				result = colorize(result, effectiveColor, 'foreground')
			}

			const finalBg = effectiveBackgroundColor ?? inheritedBg?.()
			if (finalBg) {
				result = colorize(result, finalBg, 'background')
			}

			if (effectiveBold) result = chalk.bold(result)
			if (effectiveItalic) result = chalk.italic(result)
			if (effectiveUnderline) result = chalk.underline(result)
			if (effectiveStrikethrough) result = chalk.strikethrough(result)
			if (effectiveInverse) result = chalk.inverse(result)

			return result
		}
	})

	let isHidden = $derived(accessibility?.isScreenReaderEnabled && ariaHidden)
	let showAriaLabel = $derived(accessibility?.isScreenReaderEnabled && ariaLabel)
</script>

{#if !isHidden}
	{#if children || showAriaLabel}
		<wolfie-text
			use:wolfieProps={{ style: { ...effectiveStyles, textWrap: effectiveWrap }, internal_transform: transform }}
		>
			{#if showAriaLabel}
				{ariaLabel}
			{:else if children}
				{@render children()}
			{/if}
		</wolfie-text>
	{/if}
{/if}
