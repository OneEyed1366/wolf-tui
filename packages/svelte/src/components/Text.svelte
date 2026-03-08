<script lang="ts">
  import type { Snippet } from 'svelte'
  import { getContext } from 'svelte'
  import type { Styles } from '@wolfie/core'
  import { colorize } from '@wolfie/core'
  import chalk from 'chalk'
  import { BACKGROUND_KEY, ACCESSIBILITY_KEY } from '../context/keys'
  import type { AccessibilityContextValue } from '../context/types'
  import { resolveClassName, type ClassNameValue } from '../styles'

  interface Props {
    className?: ClassNameValue
    style?: Partial<Styles>
    'aria-label'?: string
    'aria-hidden'?: boolean
    children?: Snippet
  }

  let {
    className,
    style = {},
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    children,
  }: Props = $props()

  const accessibility = getContext<AccessibilityContextValue>(ACCESSIBILITY_KEY)
  // WHY: Box.svelte sets a getter function, not a raw string, so the background
  // color stays in sync even if the parent Box re-renders with a new color
  const parentBgFn = getContext<(() => string | undefined) | undefined>(BACKGROUND_KEY)

  const mergedStyles = $derived({
    ...resolveClassName(className),
    ...style,
  })

  // WHY: transform is a reactive function — set as internal_transform prop on wolfie-text.
  // When styles change, a new function is created, triggering the core renderer
  // to re-apply ANSI codes.
  const transform = $derived((text: string): string => {
    const s = mergedStyles as Partial<Styles>
    let result = text
    if (s.color) result = colorize(result, s.color, 'foreground')
    const bg = s.backgroundColor ?? parentBgFn?.()
    if (bg) result = colorize(result, bg, 'background')
    if (s.fontWeight === 'bold') result = chalk.bold(result)
    if (s.fontStyle === 'italic') result = chalk.italic(result)
    if (s.textDecoration === 'underline') result = chalk.underline(result)
    if (s.textDecoration === 'line-through') result = chalk.strikethrough(result)
    if ((s as any).inverse) result = chalk.inverse(result)
    return result
  })

  const isScreenReaderEnabled = $derived(accessibility?.isScreenReaderEnabled ?? false)
</script>

{#if !(isScreenReaderEnabled && ariaHidden)}
  <wolfie-text style={mergedStyles} internal_transform={transform}>
    {#if isScreenReaderEnabled && ariaLabel}
      {ariaLabel}
    {:else}
      {@render children?.()}
    {/if}
  </wolfie-text>
{/if}
