# wolf-tui

<cross_adapter_demo_parity>
Every component that ships in all five adapters (React / Vue / Angular / Solid / Svelte) must render a visually identical demo in each `examples/<framework>_showcase` (and `examples/<framework>_invaders` where applicable). The only permitted differences are brand/framework color accents (e.g. cyan title in one, magenta in another) and framework-idiomatic child iteration syntax (`map`, `For`, `#each`, `v-for`, `*ngFor`).

Why: the five demos are our runtime regression harness. Visual drift hides bugs — if React's demo wraps ScrollView in a border box and Angular's doesn't, a broken border primitive in Angular looks "correct" and ships (this exact case happened on 2026-04-17 for ScrollView). Identical demos make the five frames diff-able: any visual delta between adapters is the bug signal.

Forbidden:

- Different wrapper chrome around the same component across adapters (one has `borderStyle: 'round'`, another has none)
- Different outer padding / margin / gap around the demo
- Different help-line wording (`↑↓=scroll` vs `arrow-keys=scroll` vs `Up/Down=scroll`)
- Different status-line format (`offset: 3 / 22` vs `offset=3 contentHeight=30`)
- Different fixture data (one demo has 30 items with random suffix, another has 10 items plain)
- Shipping the demo in one adapter without porting to the other four in the same branch (unless explicitly scoped as follow-up in the PR description)

Required:

- Same outer `<Box>` style (`borderStyle`, `borderColor`, `padding`, `marginTop`, `flexDirection`)
- Same help text, word-for-word
- Same fixture constants (`ITEMS.length`, label format, `VIEWPORT`/`HEIGHT`)
- Same status-line copy and number formatting
- Same title text ("ScrollView Demo" — not "Scroll View Demo" in one, "ScrollView" in another)

Exception:

- Brand accent color on the title (no need to synchronize — cyan everywhere is fine; if one adapter uses magenta intentionally, that's ok)
- Framework-idiomatic iteration: `items.map(i => <Text>{i}</Text>)` (React) vs `<For each={items}>{i => <Text>{i}</Text>}</For>` (Solid) — syntax, not visual

Out of scope:

- `examples/<fw>_{esbuild,vite,webpack}/` — bundler integration samples, not cross-adapter component demos. Parity not required; these are allowed to differ per adapter based on what each bundler needs to demonstrate.

Verification:

- When adding a demo to one adapter, before merging: run `node examples/<fw>_showcase/verify.cjs` for all 5 and visually diff the captured frames. Any delta that isn't brand color or iteration syntax = parity violation, fix before merging.
  </cross_adapter_demo_parity>

## Project Overview

wolf-tui is a framework-agnostic Terminal User Interface library. Write CLI apps with React, Vue, Angular, SolidJS, or Svelte using JSX/template syntax, Flexbox/Grid layouts (via Taffy), and CSS-like styling.

```
                          ┌──────────────────┐
                          │  internal/core   │  Taffy layout, DOM, renderer
                          │  (@wolf-tui/core)  │  native .node bindings (napi-rs)
                          └────────┬─────────┘
                                   │
                          ┌────────┴─────────┐
                          │ internal/shared   │  render scheduler, input parsing
                          └────────┬─────────┘
                                   │
       ┌──────────────┬────────────┼────────────┬──────────────┐
       │              │            │             │              │
  ┌────┴─────┐  ┌─────┴────┐  ┌───┴────┐  ┌────┴─────┐  ┌────┴─────┐
  │ packages/│  │ packages/│  │packages│  │ packages/│  │ packages/│
  │ react    │  │ vue      │  │angular │  │ solid    │  │ svelte   │
  └────┬─────┘  └─────┬────┘  └───┬────┘  └────┬─────┘  └────┬─────┘
       │              │            │             │              │
  ┌────┴─────┐  ┌─────┴────┐  ┌───┴─────┐  ┌───┴──────┐  ┌───┴──────┐
  │ examples/│  │ examples/│  │examples/│  │ examples/│  │ examples/│
  │ react_   │  │ vue_     │  │angular_ │  │ solid_   │  │ svelte_  │
  │ invaders │  │ invaders │  │invaders │  │ invaders │  │ invaders │
  └──────────┘  └──────────┘  └─────────┘  └──────────┘  └──────────┘

  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
  │ internal/css-    │  │ packages/plugin   │  │ packages/typescript- │
  │ parser           │  │ Vite/esbuild/     │  │ plugin               │
  │(@wolf-tui/css-   │  │ webpack/Rollup    │  │(@wolf-tui/typescript-│
  │ parser)          │  │(@wolf-tui/plugin) │  │ plugin)              │
  └──────────────────┘  └──────────────────┘  └──────────────────────┘
```

Bundler integration samples live in `examples/<fw>_{esbuild,vite,webpack}/`. Not every combination exists today — Solid currently ships `solid_esbuild` and `solid_webpack` (no `solid_vite`); React/Vue/Angular/Svelte have all three. All bundler combos can be regenerated via `create-wolf-tui` (`packages/create-wolf-tui`).

Workspace: **pnpm** monorepo. Node >= 20, pnpm >= 9.

## Monorepo Commands

| Command             | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| `pnpm build`        | Build all packages (recursive)                                      |
| `pnpm test`         | Run all unit tests (recursive)                                      |
| `pnpm test:related` | Run only tests related to staged changes                            |
| `pnpm test:e2e`     | Run E2E screenshot tests (24 tests across 5 apps)                   |
| `pnpm lint`         | ESLint check                                                        |
| `pnpm lint:fix`     | ESLint auto-fix                                                     |
| `pnpm format`       | Prettier format (write)                                             |
| `pnpm format:check` | Prettier check                                                      |
| `pnpm typecheck`    | `tsc --build --noEmit`                                              |
| `pnpm check`        | `concurrently (lint, build)` + `typecheck` + `test` (full CI gate)  |
| `pnpm benchmark`    | Run a benchmark script via `vite-node` (pass file path as argument) |

> [!NOTE]
> There is no `pnpm dev` script at the root. To watch a specific package, use `pnpm --filter <pkg> dev` (each package defines its own `dev` script — typically `vite build --watch`).

### Per-Package Build

```bash
pnpm --filter @wolf-tui/core build
pnpm --filter @wolf-tui/react build
pnpm --filter @wolf-tui/vue build
pnpm --filter @wolf-tui/angular build
pnpm --filter @wolf-tui/solid build
pnpm --filter @wolf-tui/svelte build
pnpm --filter @wolf-tui/react-game-invaders build
pnpm --filter @wolf-tui/vue-game-invaders build
pnpm --filter @wolf-tui/angular-game-invaders build
pnpm --filter @wolf-tui/solid-game-invaders build
pnpm --filter @wolf-tui/svelte-game-invaders build
```

### Dev with Logging

Logging is opt-in via the `WOLFIE_LOG` environment variable. There is no dedicated `dev:log:*` script — set it inline when running `verify.cjs` (see [WOLFIE_LOG section](#wolfie_log--internal-logging) below).

## CI & Release Process

The full pipeline lives in `.github/workflows/ci.yml`. Triggered on every push to `master` and via `workflow_dispatch`.

### Jobs (in order)

1. **`native`** — builds Rust `.node` bindings for 5 platforms (linux x64/arm64, macOS Intel/ARM, Windows x64) via napi-rs
2. **`collect-native`** — merges all 5 platform artifacts into a single `wolfie-core-node` artifact
3. **`checks`** — runs `pnpm check` (lint + build + typecheck + test). Uploads `build-output` artifact for reuse downstream
4. **`e2e`** — Playwright screenshot tests
5. **`release`** — `googleapis/release-please-action@v4` creates or updates the release PR
6. **`auto-merge-release`** — auto-merges the release PR using `PAT_TOKEN` (release-please defaults stay green)
7. **`publish`** — runs only if a release was created OR `force_publish=true`. Executes `pnpm -r publish` with `NPM_TOKEN` and `PAT_TOKEN`

### Release Please

- Config: `.release-please-config.json` (one entry per publishable package, component name = npm name without scope)
- Manifest: `.release-please-manifest.json` (tracks current released version per path)
- **Only `feat:`, `fix:`, and `deps:` commits are "releasable units"** that trigger a release PR. `chore:`, `docs:`, `test:`, `refactor:`, `style:`, `ci:`, `build:` are NOT releasable — they show up in the changelog only if explicitly configured. Breaking changes (`feat!:`, `fix!:`, or footer `BREAKING CHANGE:`) trigger a major version bump. See [release-please README](https://github.com/googleapis/release-please#step-1-ensure-releasable-units-are-merged) for the full list.
- The release PR is titled `chore: release master` and lives on branch `release-please--branches--master`.

### napi prepublish hook

`@wolf-tui/core` has a `"prepublishOnly": "napi prepublish -t npm"` hook that runs automatically before `pnpm -r publish`. **It does NOT copy `*.node` files** — that's done by an inline bash loop in the `publish` job (step `Move binaries into platform packages`). What `napi prepublish` actually does:

1. Bumps each `internal/core/npm/<platform>/package.json` to the current `@wolf-tui/core` version
2. Publishes platform packages alongside the main package

Required CI sequence:

1. Download the `wolfie-core-node` artifact into `internal/core/` (gives us `*.node` + `index.cjs`)
2. Move binaries: shell loop copies `wolfie-layout.<platform>.node` → `internal/core/npm/<platform>/`
3. `pnpm -r publish` runs, triggering `prepublishOnly` → npm publish of `@wolf-tui/core` + 5 platform packages

A `GITHUB_TOKEN`/`PAT_TOKEN` is required because napi probes the GitHub release API even with `--gh-release off`.

### Manual workflow_dispatch inputs

```bash
# Force-republish all packages without a release PR
# (e.g., to update package.json metadata after merging a `chore:` commit)
gh workflow run ci.yml -f force_publish=true

# Skip lint/build/typecheck/test (rarely needed — emergency reruns)
gh workflow run ci.yml -f skip_checks=true

# Skip only Playwright E2E (faster iteration when E2E is flaky)
gh workflow run ci.yml -f skip_e2e=true
```

### Aggregated GitHub Releases

After a successful publish, `scripts/group-releases.mjs` collapses the 11 per-package GitHub releases that release-please created into a single `release-YYYY-MM-DD` release containing the merged changelog. Per-package git tags and npm versions stay intact.

## Package Metadata Standards

All publishable packages MUST have these fields in `package.json` for npm discoverability and search engine indexing:

| Field           | Required | Notes                                                                                                       |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `name`          | yes      | Always scoped under `@wolf-tui/*` (except `create-wolf-tui` for npx scaffolding)                            |
| `description`   | yes      | Full sentence with framework names, mention "wolf-tui" and "Taffy" where relevant — npm uses this in search |
| `keywords`      | yes      | At minimum: `tui`, `terminal`, `terminal-ui`, `wolf-tui` + framework-specific tags                          |
| `repository`    | yes      | `{ type, url, directory }` — `directory` enables monorepo-aware npm links                                   |
| `homepage`      | yes      | Deep link to package README on master: `https://github.com/OneEyed1366/wolf-tui/tree/master/<path>#readme`  |
| `bugs.url`      | yes      | Always the monorepo Issues page                                                                             |
| `author`        | yes      | `A.Prokopenko <psevdoproger@gmail.com>`                                                                     |
| `license`       | yes      | `MIT`                                                                                                       |
| `publishConfig` | yes      | `{ "access": "public" }` for public scoped packages                                                         |

Internal-only packages use `"private": true` (e.g., `internal/build-config`, `internal/spec`) and skip the SEO fields. They are not published to npm.

When updating metadata only (no code changes), use a `chore(seo):` or `docs(meta):` commit — then manually trigger `force_publish=true` (see above) to push updated metadata to the npm registry.

## Package Build Notes

- **React / Vue / Solid / Svelte** — Vite lib mode, outputs ES modules (`dist/index.js`)
- **Angular** — Vite SSR mode, outputs CJS (`dist/index.cjs`)
- **Solid** — bundles `solid-js` INTO its output (not external). Node resolves `solid-js` to its server build otherwise, which breaks the universal renderer.
- **internal/core** — contains native `.node` bindings (Taffy via napi-rs). These are platform-specific and not git-tracked. In a fresh clone or worktree, they need to be built or copied.
- **Root `package.json`** has `"type": "module"` — all standalone scripts must use `.cjs` extension or dynamic `import()`.

## Headless Testing (verify.cjs)

Each app has a `verify.cjs` for headless rendering without a TTY. Pattern:

1. Set `WOLFIE_VERIFY=1` BEFORE any imports (Angular's zone.js patches timers on import)
2. Create fake stdout/stdin/stderr via `EventEmitter`
3. Render the app with `render()` or `renderWolfie()`
4. Send keystrokes, assert frame output

### Stdin Differences

| Framework | Stdin Pattern                       | `debug` Mode                                            |
| --------- | ----------------------------------- | ------------------------------------------------------- |
| React     | `readable` event + `read()` dequeue | `debug: true` (sync rendering OK)                       |
| Vue       | `data` events                       | `debug: false` + `maxFps: 30`                           |
| Angular   | `data` events                       | `debug: true` + `NgZone.runOutsideAngular()` for delays |
| Solid     | `data` events                       | `debug: false` + `maxFps: 30`                           |
| Svelte    | `data` events                       | `debug: false` + `maxFps: 30`                           |

Vue, Solid, and Svelte MUST NOT use `debug: true` with game ticks — it floods the event loop and starves `setTimeout`. React and Angular (with `NgZone.runOutsideAngular()` for delays) can use `debug: true`.

### Running Verify Scripts

```bash
# Build first, then run
pnpm --filter @wolf-tui/react-game-invaders build && node examples/react_invaders/verify.cjs
pnpm --filter @wolf-tui/vue-game-invaders build && node examples/vue_invaders/verify.cjs
pnpm --filter @wolf-tui/angular-game-invaders build && node examples/angular_invaders/verify.cjs
pnpm --filter @wolf-tui/solid-game-invaders build && node examples/solid_invaders/verify.cjs
pnpm --filter @wolf-tui/svelte-game-invaders build && node examples/svelte_invaders/verify.cjs
```

### WOLFIE_LOG — Internal Logging

```bash
WOLFIE_LOG=1 WOLFIE_LOG_FILE=debug.log node examples/react_invaders/verify.cjs
```

Output: JSONL file (one event per line). Categories: `angular`, `dom`, `input`, `layout`, `measure`, `meta`, `render`, `solid`, `style`, `svelte`, `vue`.

```bash
# Analyze logs
node scripts/analyze-log.cjs debug.log --summary
node scripts/analyze-log.cjs debug.log --cat style
node scripts/analyze-log.cjs debug.log --cat layout
node scripts/analyze-log.cjs debug.log --cat input

# Cross-adapter comparison
node scripts/analyze-log.cjs react.log vue.log --diff

# Filter with jq
jq 'select(.cat=="style")' debug.log
```

## E2E Screenshot Tests

Pipeline: ANSI frame -> `ansi-to-html` -> HTML template -> Playwright Chromium -> PNG

```bash
pnpm test:e2e
```

- 24 tests across 5 apps (react: 5, vue: 5, angular: 5, solid: 5, svelte: 4)
- Screenshots saved to `e2e/__screenshots__/<app>/<screen>.png`
- Config: `e2e/vitest.config.ts`
- Fresh Docker container needs: `npx playwright install-deps chromium`
- `game.png` screenshots regenerate each run (game state is time-dependent) — diff in git is normal if all 24 tests pass

## Known Quirks (Angular)

### Signal `input()` is Broken

Parent `[prop]="expr"` bindings don't propagate to child signal inputs — inputs stay at defaults.

**Workaround:** Inject a service via DI, use `computed()` to read state directly.

### Dynamic `[className]` is Broken

`[className]="expr"` doesn't trigger CSS resolution. Static `className="..."` works.

**Workaround:** Use `[style]="{ color: '#hex' }"` for dynamic colors.

### Layout Stretching Bug (Host Elements)

When Angular removes a host element from a non-host parent, its children's Taffy layout nodes can be orphaned. `removeChildNode()` in `internal/core/src/dom.ts` now checks both `removeNode.layoutNodeId !== undefined` **and** `removeNode.parentNode?.layoutNodeId !== undefined` before calling `layoutTree.removeChild`. This guards the napi crash, but the underlying orphan-children case may still cause layout drift in deeply nested host-element trees — re-verify any new Angular Box/Text composition patterns with `verify.cjs` snapshots before merging.

## Known Quirks (Svelte)

### vite-node Dev Mode: $state Reactivity Broken Across Modules

`vite-node` runs in SSR mode, which causes Svelte's `svelte/internal/client` module to be instantiated **twice** — once for `.svelte` components, once for `.svelte.ts` modules. Each instance has its own signal registry and `active_effect` tracker. Result: `$state` mutations in `.svelte.ts` files (e.g., `useInvaders.svelte.ts`) never notify `$effect`/`{#if}` blocks in `.svelte` components.

**Symptoms:**

- Local `$state` in `.svelte` components works (arrow keys update `selectedIndex`)
- Cross-module `$state` in `.svelte.ts` modules appears to update (value changes) but doesn't trigger re-renders
- `$effect` watching cross-module state fires once on mount, never again

**Root cause:** vite-node's SSR module loader creates separate module instances of `svelte/internal/client` for different transform pipelines. Signals and effects end up in disconnected registries.

**Workaround:** The `dev` script uses `vite build && node --conditions=browser dist/index.js` instead of `vite-node`. Build produces a single bundle with one Svelte runtime instance → reactivity works.

**Mitigations in vite.config.ts (partial, not sufficient alone):**

- `optimizeDeps: { exclude: ['svelte', '@wolf-tui/svelte'] }` — prevents pre-bundled vs SSR-transformed dual-runtime (fixes `active_effect === null` crash)
- `dynamicCompileOptions() { return { generate: 'client' } }` — forces client compilation in SSR mode (prevents server-mode no-reactivity)
- `ssr.noExternal: ['@wolf-tui/svelte', 'svelte']` — bundles inline instead of node_modules resolution

These mitigations fix the crash but NOT the cross-module reactivity. Only the build-then-run approach fully works.

### Svelte Stdin Pattern

Svelte uses `data` events (same as Vue/Solid, NOT React's `readable` + `read()` pattern). `debug: false` + `maxFps: 30` for game loops.

## Docker Constraint

No interactive TTY is available in Docker/CI. Do not attempt to run apps interactively.

**Use instead:**

1. `verify.cjs` scripts for headless rendering validation
2. `pnpm test:e2e` for screenshot-based visual testing
3. `WOLFIE_LOG=1` for runtime debugging via log analysis

## API Quick Reference

### render / renderWolfie

```typescript
// React
render(element, { stdout, stdin, stderr, debug, exitOnCtrlC, maxFps })

// Vue
render(Component, { stdout, stdin, stderr, debug, maxFps })

// Angular
renderWolfie(AppComponent, { stdout, stdin, stderr, debug, exitOnCtrlC })

// Solid
render(App, { stdout, stdin, stderr, debug, maxFps })

// Svelte
render(App, { stdout, stdin, stderr, debug, maxFps })
```

- `debug: true` disables frame throttling (synchronous rendering for tests)
- `maxFps` caps render frequency (use 30 for Vue/Solid/Svelte in game loops)

### ANSI Key Sequences

| Key    | Sequence |
| ------ | -------- |
| Up     | `\x1b[A` |
| Down   | `\x1b[B` |
| Enter  | `\r`     |
| Escape | `\x1b`   |
| Space  | ` `      |

## WNode Render Function Philosophy

### The Pattern

Every display component uses a shared pure render function in `@wolf-tui/shared`:

```ts
renderXxx(viewState: XxxViewState, theme: XxxRenderTheme): WNode
```

Each adapter converts the WNode to framework elements:

- React: `wNodeToReact(wnode)` → `ReactElement`
- Vue: `wNodeToVue(wnode)` → `VNode`
- Solid: `wNodeToSolid(wnode)` → `JSX.Element`
- Svelte: `wNodeToSvelte(wnode)` → `WolfieElement`
- Angular: `<w-wnode-outlet [node]="wnode()" />`

### The Debugging Contract

All 5 adapters consume the same render function. Any visual bug has exactly two sources:

1. **Render function** — broken in ALL adapters simultaneously → fix once, fixed everywhere
2. **Adapter integration** — broken in ONE adapter only → recheck the integration pattern

This two-step debug path replaces unbounded cross-adapter diffing.

### Migration Boundary

| Migrated                                                                                                                                                   | Why possible                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Alert, Badge, Spinner, StatusMessage, Select, MultiSelect, TextInput, ConfirmInput, PasswordInput, EmailInput, ProgressBar, ErrorOverview, Spacer, Newline | Full output derivable from plain data |

| Deferred                   | Why not (yet)                                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Box, Text                  | Accepts user JSX children (ReactElement/VNode) — not WNode-serializable; also reads framework contexts (accessibility, background) |
| OrderedList, UnorderedList | Item content is user JSX subtrees — not plain data                                                                                 |
| Static                     | Special renderer semantics that bypass the WNode pipeline entirely                                                                 |
| Transform                  | `transform: (text) => string` function prop cannot be WNode data                                                                   |

## Key Files Reference

When debugging or extending the project, these are the files agents most commonly need to inspect:

| Path                                      | Purpose                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                | Full CI/CD pipeline: native build, tests, release-please, npm publish                 |
| `.release-please-config.json`             | Per-package release-please configuration (components, paths, versioning strategy)     |
| `.release-please-manifest.json`           | Current released version per package — DO NOT edit by hand                            |
| `internal/core/src/dom.ts`                | DOM tree management + Taffy layout integration (`removeChildNode`, `appendChildNode`) |
| `internal/shared/src/wnode/`              | Pure render functions shared across all 5 adapters (see WNode Render Philosophy)      |
| `internal/shared/src/render-scheduler.ts` | Frame throttling, `maxFps`, `debug` mode logic                                        |
| `scripts/group-releases.mjs`              | Post-publish aggregation of per-package GitHub releases into a single dated release   |
| `scripts/analyze-log.cjs`                 | WOLFIE_LOG JSONL analysis (--summary, --cat, --diff)                                  |
| `pnpm-workspace.yaml`                     | Workspace package globs                                                               |
| `tsconfig.base.json`                      | Shared TS config inherited by all packages                                            |
| `eslint.config.js`                        | Flat ESLint config (root only — packages do not override)                             |
