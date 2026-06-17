# Angular Signals — Rulebook for wolf-tui

Source: [angular.dev/guide/signals](https://angular.dev/guide/signals). TUI context — ignore SSR/routing/module-federation topics.

## Signal type selection

- `signal<T>(initial)` — writable state; consumers call `.set(v)` or `.update(prev => ...)`.
- `computed(() => ...)` — lazy, memoized, read-only derivation. Use for expensive calcs.
- `effect(() => ...)` — **only** for side effects to non-reactive APIs (logging, imperative DOM-like ops). **Never** for state derivation (use `computed` instead).
- `afterRenderEffect()` — side effects that need post-render timing.

## Public API discipline

- Expose library signals via `.asReadonly()` — consumers can read but not mutate directly.
- Force consumers to call your service methods instead of writing to raw signals.
- Mark internal writable signals with TypeScript `private`.

## Change detection with OnPush

- When an OnPush component reads a signal in the template, Angular auto-marks it for check. No manual `markForCheck()` needed.
- Library code should NOT assume consumers know this — it "just works".

## Dependency tracking

- Signal reads are tracked **only in synchronous code**. Reads after `await` are not tracked:
  ```ts
  effect(async () => {
    const v = mySignal();              // ✅ tracked
    await somePromise();
    const later = mySignal();          // ❌ NOT tracked
  });
  ```
- Use `untracked(() => signal())` to read without registering a dependency.

## Equality

- Default is referential equality (`===`).
- Provide custom `equal: (a, b) => ...` only when storing complex objects / arrays and want semantic equality.

## Effect lifecycle

- Effects run "eventually" — not synchronously after signal mutation. Avoid timing assumptions.
- Return a cleanup function from an effect body for subscription teardown:
  ```ts
  effect((onCleanup) => {
    const sub = stream.subscribe(...);
    onCleanup(() => sub.unsubscribe());
  });
  ```

## Defensive helpers

- `isSignal(value)` / `isWritableSignal(value)` — check without throwing. Useful when accepting polymorphic inputs.

## wolf-tui Angular specifics (BAKED — enforce)

- Stdin: `data` events.
- **BROKEN — signal `input()`**: parent `[prop]="expr"` bindings do NOT propagate to child signal inputs. Inputs stay at defaults. **Workaround:** inject a service via DI, read state with `computed()` from the service.
- **BROKEN — dynamic `[className]`**: does NOT trigger CSS resolution. **Workaround:** `[style]="{ color: '#hex' }"`.
- **Host-element bug (diagnosed, in `internal/core/src/dom.ts`):** `removeChildNode()`'s `layoutNodeId !== undefined` fails for host elements → orphaned Taffy nodes → stretched layout. Coordinate with wolf-core if you touch host components.
- Output: Vite SSR mode → `dist/index.cjs` (CJS, not ESM).
- Zone.js trap: patches timers on import → `process.env.WOLFIE_VERIFY = '1'` MUST be set BEFORE any import in verify.cjs.
- `debug: true` OK; use `NgZone.runOutsideAngular()` for `setTimeout` delays.

## Code review checklist

- [ ] Public signals wrapped in `.asReadonly()` before export
- [ ] No `effect()` used to derive state — use `computed()`
- [ ] No signal reads after `await` in an effect
- [ ] `untracked()` used deliberately, with a comment if non-obvious
- [ ] Subscription-style effects return cleanup via `onCleanup`
- [ ] No use of `input()` for cross-parent bindings — DI + `computed()` instead
- [ ] No dynamic `[className]` — use `[style]`
- [ ] Types are strict (no `any` / `as`)
