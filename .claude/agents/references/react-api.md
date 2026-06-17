# React — Rulebook for wolf-tui

Derived from Vercel Engineering's public guides (`~/.claude/skills/vercel-react-best-practices/SKILL.md`, `~/.claude/skills/vercel-composition-patterns/SKILL.md`), filtered for TUI context. Web-only rules (SSR, hydration, bundle size, Suspense streaming, resource hints) are omitted.

## Re-render Optimization

- **`rerender-defer-reads`** — don't subscribe to state used only in callbacks. Read via ref or closure inside the handler.
- **`rerender-memo`** — extract expensive work into a memoized child component; parent re-renders don't re-cost.
- **`rerender-memo-with-default-value`** — hoist non-primitive default props (objects, arrays, callbacks) outside the component to keep identity stable.
- **`rerender-dependencies`** — effect deps must be primitives where possible. Objects and new arrays each render invalidate the effect.
- **`rerender-derived-state`** — subscribe to derived booleans, not raw values that change often.
- **`rerender-derived-state-no-effect`** — derive during render, not in `useEffect`. An effect to compute derived state causes a second render.
- **`rerender-functional-setstate`** — `setX(prev => prev + 1)` keeps setter callbacks stable and frees you from depending on the current value.
- **`rerender-lazy-state-init`** — `useState(() => expensive())` runs the expensive computation once at mount, not every render.
- **`rerender-simple-expression-in-memo`** — don't `useMemo` a primitive arithmetic; the memo bookkeeping is more expensive.
- **`rerender-split-combined-hooks`** — split a hook that packs independent pieces of state — they invalidate each other unnecessarily.
- **`rerender-move-effect-to-event`** — if logic fires in response to a user action, put it in the event handler, not an effect listening to state change.
- **`rerender-transitions`** — `startTransition(() => setX(v))` for non-urgent updates (heavy layout). Keeps input responsive.
- **`rerender-use-deferred-value`** — `useDeferredValue(v)` to smooth input-driven redraws.
- **`rerender-use-ref-transient-values`** — frequent values that don't need to rerender the UI go in a ref.
- **`rerender-no-inline-components`** — never define `const Sub = () => ...` inside a parent component: remounts every render.

## Rendering Performance (TUI-relevant subset)

- **`rendering-hoist-jsx`** — extract static JSX above/outside the component; identity is stable and diffing is cheap.
- **`rendering-conditional-render`** — use ternary `cond ? <A /> : <B />` instead of `cond && <A />` when you care about consistent render paths (also avoids the `0 && ...` trap).
- **`rendering-usetransition-loading`** — prefer `useTransition` over ad-hoc `isLoading` state for deferred-UI loading feedback.

## JavaScript Performance

- **`js-index-maps`** — build `Map` for repeated lookups instead of `.find()` in loops.
- **`js-cache-property-access`** — in hot loops, `const len = arr.length; const x = obj.prop;` before the loop.
- **`js-cache-function-results`** — module-level `Map` memoization for pure expensive functions (manual memoization).
- **`js-combine-iterations`** — fuse `.filter(...).map(...)` into one pass where practical.
- **`js-length-check-first`** — short-circuit on `arr.length === 0` before any heavier comparison.
- **`js-early-exit`** — return early to flatten control flow and skip work.
- **`js-hoist-regexp`** — `const RE = /.../` at module scope, not inside the function body.
- **`js-min-max-loop`** — a single loop with a running min/max is cheaper than `.sort()` just to pick one value.
- **`js-set-map-lookups`** — `Set.has(x)` is O(1); `arr.includes(x)` is O(n).
- **`js-tosorted-immutable`** — `arr.toSorted(...)` (ES2023) instead of mutating `arr.sort(...)`.
- **`js-flatmap-filter`** — return `[]` inside `.flatMap` to drop an item — filter+map in one pass.
- **`js-batch-dom-css`** — in TUI: batch style property writes into one object, not field-by-field updates.

## Advanced Patterns

- **`advanced-effect-event-deps`** — don't put `useEffectEvent` results in effect deps; they're stable by design.
- **`advanced-event-handler-refs`** — store event handlers in refs when they must stay stable across renders (input handler passed to WNode, for instance).
- **`advanced-init-once`** — initialize app-wide state once per app load; guard against StrictMode double-invocation in dev.
- **`advanced-use-latest`** — a `useLatestRef(x)` pattern gives handlers stable identity while still seeing the latest value.

## Composition Patterns

### Architecture
- **`architecture-avoid-boolean-props`** — don't add `isLarge`, `isPrimary`, `hasBorder` etc.; use composition (explicit variants or children).
- **`architecture-compound-components`** — complex widgets expose subcomponents that share context (e.g., `<Select>` with `<Select.Option>`).

### State management
- **`state-decouple-implementation`** — provider is the only place that knows how state is managed; consumers don't care.
- **`state-context-interface`** — define a generic `{ state, actions, meta }` interface for DI, so provider swaps don't cascade.
- **`state-lift-state`** — lift state into a provider to let siblings coordinate without prop-drilling.

### Implementation
- **`patterns-explicit-variants`** — `<ButtonPrimary>` / `<ButtonSecondary>` beats `<Button variant="primary" />` when behavior diverges.
- **`patterns-children-over-render-props`** — `children` with context beats `renderX` props for composition.

### React 19 APIs
- **`react19-no-forwardref`** — React 19 lets refs be a normal prop. `forwardRef` is no longer required; use `use(Context)` instead of `useContext(Context)` inside conditional code.

## wolf-tui React specifics

- Stdin: `readable` event + `read()` dequeue.
- `debug: true` OK in verify.cjs.
- `useInput` hook (primary API). Fixture `packages/react/test/fixtures/use-input.tsx` has cc=127 — do NOT refactor without full coverage.
- Output: Vite lib mode → ESM.
- `wNodeToReact(wnode) → ReactElement`.

## Deep-dive

Full rule files with code examples live in:
- `~/.claude/skills/vercel-react-best-practices/rules/<rule-name>.md`
- `~/.claude/skills/vercel-composition-patterns/rules/<rule-name>.md`

Invoke the skill via the Skill tool (`vercel-react-best-practices` / `vercel-composition-patterns`) when the project-level summary above isn't enough.
