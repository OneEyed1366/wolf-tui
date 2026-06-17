# Svelte 5 Runes — Rulebook for wolf-tui

Source: [svelte.dev/docs/svelte/$state](https://svelte.dev/docs/svelte/$state). TUI context — ignore SvelteKit routing / form actions / server load topics.

## `$state`

- Deeply reactive by default: arrays and plain objects become proxies; nested mutations trigger granular updates.
- Plain JS assignment — no wrapper functions:
  ```svelte
  let count = $state(0);
  count++;                 // updates UI
  ```
- Classes aren't proxified. Use `$state` on class fields and the compiler generates getter/setter pairs.

## `$state.raw`

- No proxy — large arrays/objects when you won't mutate in place.
- Reassignment only: `items = [...items, newItem]`. Mutations to raw state DO NOT update UI.
- Raw arrays can still contain reactive children (they'll propagate individually).

## `$state.snapshot`

- Convert a proxy back to a plain object/array.
- Required when handing state to external libraries that choke on proxies, or for `structuredClone`.

## Destructuring caveat

- Destructured references are snapshots at that point — they do not track future updates.
- Pass objects/arrays around, destructure inside templates, or use getter closures.

## Cross-module state — CRITICAL

- `$state` is compiled per-file. You cannot export a `$state` variable and reassign from another module — the wrapper context is lost.
- **Workarounds:**
  - Export an object/array and mutate its properties from other modules.
  - Export getter/setter functions wrapping the internal state:
    ```ts
    // counter.svelte.ts
    let _count = $state(0);
    export const getCount = () => _count;
    export const setCount = (v: number) => (_count = v);
    ```
  - Never export directly reassigned `$state` primitives.

## `$derived` and `$derived.by`

- `$derived(expression)` — compact syntax for pure derivations.
- `$derived.by(() => { ... })` — block form when you need imperative logic inside the derivation.
- Replaces `$:` reactive statements from Svelte 4.

## `$effect` and `$effect.pre`

- `$effect(() => { ... })` — runs after the component renders. Return a cleanup function for subscription teardown.
- `$effect.pre(() => { ... })` — runs BEFORE the DOM updates. Use for measurements before paint.
- Tracks referenced reactive values automatically — do not pass a dependency array.
- **Prefer `$derived` over `$effect` for computing values** — effects are side-effect channels, derived values are state.

## `$props()` and `$bindable()`

- `$props()` — destructure a component's props with types and defaults:
  ```svelte
  let { count = 0, onChange }: { count?: number; onChange?: (v: number) => void } = $props();
  ```
- `$bindable()` — mark a prop as two-way bindable from the parent.

## `$inspect` and `$host`

- `$inspect(...refs)` — dev-mode tracing that logs when the given reactive values change. Remove before shipping.
- `$host()` — the custom-element host, only relevant when Svelte components compile to web components.

## wolf-tui Svelte specifics (BAKED)

- Stdin: `data` events.
- Games: `debug: false` + `maxFps: 30`.
- **CRITICAL — vite-node dev is broken**: `vite-node` instantiates `svelte/internal/client` TWICE (once for `.svelte`, once for `.svelte.ts`). `$state` mutations in `.svelte.ts` never notify `$effect`/`{#if}` in `.svelte`. Dev script uses `vite build && node --conditions=browser dist/index.js` instead.
- Vite mitigations (partial — fix crash only, not the dual-module issue alone):
  - `optimizeDeps.exclude: ['svelte', '@wolf-tui/svelte']`
  - `dynamicCompileOptions: () => ({ generate: 'client' })`
  - `ssr.noExternal: ['@wolf-tui/svelte', 'svelte']`
- WNode adapter: `wNodeToSvelte()` → `WolfieElement`.
- DOM shim pattern documented in `memory/svelte-adapter.md` (Option F + wolfie-action).

## Code review checklist

- [ ] Prefer `$derived` over `$effect` for values
- [ ] `$effect` has a cleanup return when it creates subscriptions
- [ ] Cross-module state NEVER exports a reassignable `$state` — uses getter/setter or mutation patterns
- [ ] `$state.raw` used for large non-mutated data
- [ ] `$state.snapshot()` applied before handing state to external libs
- [ ] No destructured `$state` kept as locals (they're static snapshots)
- [ ] `$inspect` removed before shipping
- [ ] Types strict (no `any` / `as`)
