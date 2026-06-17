# SolidJS Reactivity — Rulebook for wolf-tui

Source: [docs.solidjs.com/concepts/intro-to-reactivity](https://docs.solidjs.com/concepts/intro-to-reactivity). TUI context — ignore Suspense-for-async-data, resources-for-HTTP topics.

## Signals vs stores

- `createSignal(initial)` — primitives or single values; returns `[getter, setter]`.
- `createStore(obj)` — nested objects/arrays. Granular updates without destructuring pitfalls.
- Never destructure a signal: `const { count } = someSignal()` breaks reactivity. Always invoke the getter: `someSignal().count`.

## Derived state: memo vs effect

- `createMemo(() => ...)` — derived **values** with auto-tracked dependencies; memoized; use when consumers read the value.
- `createEffect(() => ...)` — **side effects only** (logging, external API calls, imperative updates). Not for derivation.
- Rule of thumb: if you're returning/storing the result, use `createMemo`. If you're reaching out to the outside world, use `createEffect`.

## Tracking scopes

- Signals trigger updates **only when accessed inside a tracking scope**.
- JSX return statements, `createEffect`, `createMemo`, `createComputed` are tracking scopes.
- Accessing a signal outside these (e.g., in a component function body before return) won't track.
- Imperative code that needs reactivity → wrap in `createEffect`.

## Escape hatches

- `untrack(() => signal())` — read a signal without tracking.
- `on(deps, handler, { defer: true })` — explicit dependency list; useful when you want precise control or deferred initial run.
- `batch(() => { ... })` — group multiple signal writes; subscribers fire once after batch closes.

## Ownership

- `createRoot((dispose) => { ... })` — create a reactive context outside a component; return `dispose()` for manual cleanup.
- `getOwner()` + `runWithOwner()` — attach dynamic effects to an existing owner (plugin/library patterns).
- In wolf-tui: library code creating effects outside component trees MUST use `createRoot` + explicit dispose.

## Props access pitfalls

- Props are getters that only track when accessed **inside JSX or a tracking scope**.
- Accessing `props.x` in the component function body (outside return/effect) won't track.
- Destructuring props breaks reactivity: `const { x } = props` freezes it.
- Use `splitProps()` or `mergeProps()` to work with subsets reactively.

## Component lifecycle

- Components run **once** during mount — never re-run on update.
- UI updates come from fine-grained signal subscriptions inside JSX, not component re-runs.

## wolf-tui Solid specifics

- Stdin: `data` events.
- Games: `debug: false` + `maxFps: 30` (same as Vue/Svelte — `debug:true` starves setTimeout).
- **CRITICAL — solid-js bundling**: `solid-js` is BUNDLED INTO the adapter output (not marked external). Node otherwise resolves to the server build, breaking the universal renderer. Do NOT externalize `solid-js`.
- WNode adapter: `wNodeToSolid()` → `JSX.Element`.
- Vue→Solid conversion reference lives in `memory/solid-patterns.md`.

## Code review checklist

- [ ] No destructuring of props or signal getters
- [ ] Derived values use `createMemo`, not `createEffect`
- [ ] Library effects created outside components wrapped in `createRoot` with a dispose path
- [ ] `batch()` used when writing multiple signals in one action
- [ ] `untrack()` / `on()` used deliberately, with a comment
- [ ] No assumption that components re-run — they don't
- [ ] `solid-js` remains bundled, not externalized
- [ ] Types strict (no `any` / `as`)
