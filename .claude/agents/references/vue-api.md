# Vue 3 Composition API — Rulebook for wolf-tui

Source: [vuejs.org/guide/extras/reactivity-in-depth](https://vuejs.org/guide/extras/reactivity-in-depth.html). TUI context — ignore SSR/hydration/routing/bundle sections.

## Ref vs Reactive

- `ref()` — for primitives (number/string/boolean), single values, and anywhere you want explicit `.value` access.
- `reactive()` — for plain objects with multiple related properties.
- **Never** `reactive(primitive)` — use `ref()` instead.
- `shallowRef()` — when wrapping state from external systems (Immer, XState, RxJS). Prevents deep conversion overhead.
- `shallowReactive()` — when only the top level needs to be reactive (large deeply-nested objects, external state).

## Destructuring & identity

- **Never** destructure a `reactive()` object into locals — breaks the proxy chain:
  ```ts
  const { count } = reactive({ count: 0 })  // count is a disconnected primitive
  ```
- Use `toRefs()` or access via the original proxy.
- Assigning a `reactive()` proxy to a variable breaks identity (`===`) checks vs the original.
- In `<script setup>`, refs require `.value`. Template auto-unwraps.

## Reactive reassignment

- Don't reassign a `reactive()` object — mutate properties instead:
  ```ts
  Object.assign(state, newState)        // ✅
  // state = newState                   // ❌ loses the proxy reference
  ```

## Derived state: computed vs watch vs watchEffect

- `computed()` — default choice for derived values. Cached + reactive.
- `watch(source, cb)` — react to specific sources; explicit dependencies; access old+new value.
- `watchEffect(fn)` — auto-tracked; simpler but less explicit.
- Debug: `computed(fn, { onTrack, onTrigger })` or `watch(src, cb, { onTrack, onTrigger })` — dev-mode only.

## Effect scope & cleanup

- `effectScope()` groups multiple effects for batch cleanup.
- In composables, always expose a cleanup path that calls `scope.stop()` on unmount.
- Without cleanup: memory leaks in long-running TUI sessions.

## Component debug hooks

- `onRenderTracked(debugger statement)` — fires when a dep is discovered during render.
- `onRenderTriggered(debugger statement)` — fires when a re-render is triggered.

## wolf-tui Vue specifics

- Stdin: `data` events.
- Games: `debug: false` + `maxFps: 30` (the verify.cjs trap — `debug:true` starves setTimeout).
- WNode adapter: `wNodeToVue()` → VNode.
- Output: Vite lib mode → `dist/index.js` (ESM).
- No DOM access — render flows WNode → VNode → wolf-tui DOM shim → Taffy layout.

## Code review checklist (adapter changes)

- [ ] No destructuring of `reactive()` objects
- [ ] Primitives use `ref()`, not `reactive()`
- [ ] Composables expose cleanup (`scope.stop()`) if they create watchers
- [ ] `computed` used for derived values; `watch` only when side effect required
- [ ] External state (third-party libs) wrapped in `shallowRef()` / `shallowReactive()`
- [ ] No `debug: true` in verify.cjs for game apps
- [ ] Types are strict (no `any` / `as`)
- [ ] `wNodeToVue` integration unchanged unless the whole shared render contract moved
