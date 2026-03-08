<script lang="ts">
  import type { Snippet } from 'svelte'
  import { getContext, setContext } from 'svelte'
  import type { Styles } from '@wolfie/core'
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
  const parentBgFn = getContext<(() => string | undefined) | undefined>(BACKGROUND_KEY)

  const mergedStyles = $derived({
    flexWrap: 'nowrap' as const,
    flexDirection: 'row' as const,
    flexGrow: 0,
    flexShrink: 1,
    overflowX: 'visible' as const,
    overflowY: 'visible' as const,
    ...resolveClassName(className),
    ...style,
  })

  // WHY: Compute effectiveBg as reactive so it updates if style.backgroundColor
  // changes (e.g. props passed from a parent that re-renders)
  const effectiveBg = $derived(
    (mergedStyles as Partial<Styles>).backgroundColor ?? parentBgFn?.()
  )

  // WHY: setContext must be synchronous during init. Passing a getter function
  // makes the context reactive — Text reads the current value at render time
  // rather than capturing a stale string.
  setContext(BACKGROUND_KEY, () => effectiveBg)
</script>

{#if !(accessibility?.isScreenReaderEnabled && ariaHidden)}
  <wolfie-box style={mergedStyles}>
    {#if accessibility?.isScreenReaderEnabled && ariaLabel}
      <wolfie-text>{ariaLabel}</wolfie-text>
    {:else}
      {@render children?.()}
    {/if}
  </wolfie-box>
{/if}
