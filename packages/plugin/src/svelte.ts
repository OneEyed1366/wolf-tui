/**
 * Svelte-specific exports for the wolfie plugin.
 *
 * Separated into its own entry point for tree-shaking —
 * React/Vue/Angular users don't pay for Svelte-specific code.
 *
 * @example
 * import { wolfiePreprocess } from '@wolfie/plugin/svelte'
 *
 * svelte({
 *   preprocess: [vitePreprocess(), wolfiePreprocess()],
 * })
 */
export { wolfiePreprocess } from './svelte-preprocess.js'
