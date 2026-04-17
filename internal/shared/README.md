# @wolf-tui/shared

Framework-agnostic shared logic for wolf-tui adapters. Provides WNode render functions, state reducers, render scheduling, style resolution, and input parsing — everything adapters need that isn't DOM or layout.

## Overview

This package sits between `@wolf-tui/core` (DOM, layout, renderer) and the framework adapters (`@wolf-tui/react`, `@wolf-tui/vue`, etc.). It contains:

- **WNode render functions** — pure `renderXxx(viewState, theme) → WNode` for every display component
- **State reducers** — `textInputReducer`, `selectReducer`, `multiSelectReducer` with initial state factories
- **Render scheduler** — `createRenderScheduler()` with sync/async modes and custom queue support
- **Style system** — class name resolution, Tailwind metadata, global style registry
- **Theme** — `extendTheme()` and theme type definitions
- **Input parsing** — `parseInputData()` → `IKey` for keypress handling
- **Utilities** — Box/text computation, option map, email domain constants

> **Note:** This is an internal package. Most users should use `@wolf-tui/react`, `@wolf-tui/vue`, or another framework adapter instead.

## WNode System

The core abstraction: every display component has a pure render function that returns a `WNode` tree.

```typescript
import { renderAlert, type AlertViewState, type WNode } from '@wolf-tui/shared'

const viewState: AlertViewState = {
	variant: 'success',
	title: 'Done',
	message: 'Build completed',
}

const node: WNode = renderAlert(viewState, theme)
```

Each adapter converts WNodes to framework-native elements:

| Adapter | Converter                                |
| ------- | ---------------------------------------- |
| React   | `wNodeToReact(wnode)` → `ReactElement`   |
| Vue     | `wNodeToVue(wnode)` → `VNode`            |
| Solid   | `wNodeToSolid(wnode)` → `JSX.Element`    |
| Svelte  | `wNodeToSvelte(wnode)` → `WolfieElement` |
| Angular | `<w-wnode-outlet [node]="wnode()" />`    |

### Available Render Functions

| Function              | View State               | Description                       |
| --------------------- | ------------------------ | --------------------------------- |
| `renderAlert`         | `AlertViewState`         | Info/success/error/warning alerts |
| `renderBadge`         | `BadgeViewState`         | Colored label badges              |
| `renderBigText`       | `BigTextViewState`       | Large ASCII-font banners (cfonts) |
| `renderConfirmInput`  | `ConfirmInputViewState`  | Yes/no confirmation prompt        |
| `renderErrorOverview` | `ErrorOverviewData`      | Error display with stack traces   |
| `renderMultiSelect`   | `MultiSelectViewState`   | Multi-option selection list       |
| `renderNewline`       | —                        | Line break element                |
| `renderProgressBar`   | `ProgressBarViewState`   | Determinate progress indicator    |
| `renderSelect`        | `SelectViewState`        | Single-option selection list      |
| `renderSpacer`        | —                        | Whitespace filler                 |
| `renderSpinner`       | `SpinnerViewState`       | Animated loading indicator        |
| `renderStatusMessage` | `StatusMessageViewState` | Inline status with icon           |
| `renderTextInput`     | `TextInputViewState`     | Text input with cursor rendering  |

### WNode Types

```typescript
type WNode = {
  type: 'wolfie-box' | 'wolfie-text'
  props: WNodeProps
  children: Array<WNode | string>
  key?: string
}

// Factories
wbox(props, children, key?)  // → WNode with type 'wolfie-box'
wtext(props, children)       // → WNode with type 'wolfie-text'
```

## State Reducers

Framework-agnostic state management for interactive components:

```typescript
import {
	textInputReducer,
	createInitialTextInputState,
	type TextInputState,
	type TextInputAction,
} from '@wolf-tui/shared'

const state = createInitialTextInputState('')
const next = textInputReducer(state, { type: 'insert', text: 'a' })
```

| Reducer              | State Type         | Actions                                                                                      |
| -------------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| `textInputReducer`   | `TextInputState`   | `insert`, `delete`, `move-cursor-left`, `move-cursor-right`                                  |
| `selectReducer`      | `SelectState`      | `focus-next-option`, `focus-previous-option`, `select-focused-option`, `reset`, `sync-value` |
| `multiSelectReducer` | `MultiSelectState` | `focus-next-option`, `focus-previous-option`, `toggle-focused-option`, `reset`, `sync-value` |

## Render Scheduler

Batches render calls via microtasks to prevent redundant redraws:

```typescript
import { createRenderScheduler } from '@wolf-tui/shared'

const scheduler = createRenderScheduler(renderFn, {
	sync: false, // true = debug mode, no batching
	queueFn: undefined, // custom scheduler (e.g. NgZone.runOutsideAngular)
})

scheduler.scheduleRender() // batched
scheduler.flush() // force immediate
```

## Style System

Resolves class names (including Tailwind utilities) to `Styles` objects:

```typescript
import {
	resolveClassName,
	registerStyles,
	registerTailwindMetadata,
} from '@wolf-tui/shared'

registerStyles({ 'my-class': { color: 'red' } })
const styles = resolveClassName('my-class flex-1 p-2')
```

## Input Parsing

Converts raw stdin data to structured key objects:

```typescript
import { parseInputData, type IKey } from '@wolf-tui/shared'

const { input, key } = parseInputData(buffer)
// key: { upArrow: true, downArrow: false, ctrl: false, shift: false, meta: false, ... }
```

`IKey` uses boolean flags (`upArrow`, `downArrow`, `leftArrow`, `rightArrow`, `return`, `escape`, `tab`, `backspace`, `delete`, `ctrl`, `shift`, `meta`, `pageDown`, `pageUp`, `home`, `end`) rather than a `name` string.

## Project Structure

```
src/
├── wnode/              # WNode types, factories, render functions
│   ├── types.ts        # WNode, WNodeProps, wbox(), wtext()
│   ├── view-states.ts  # ViewState types for each component
│   └── render-*.ts     # Pure render functions
├── state/              # State reducers
│   ├── text-input.ts
│   ├── select.ts
│   └── multi-select.ts
├── styles/             # Style resolution and registry
├── theme/              # Theme types and extendTheme()
├── compute/            # Box and text computation utilities
├── input/              # Keypress parsing
├── renderers/          # Text input value rendering
├── lib/                # OptionMap utility
├── constants/          # Email domain defaults
├── render-scheduler.ts # Async/sync render batching
├── types.ts            # Shared type definitions
└── index.ts            # Public API barrel
```

## Build

```bash
pnpm --filter @wolf-tui/shared build    # one-off build
pnpm --filter @wolf-tui/shared dev      # watch mode
pnpm --filter @wolf-tui/shared test     # run tests
```

Output: ES module at `build/index.js` with TypeScript declarations.

## Dependencies

| Package          | Role                                               |
| ---------------- | -------------------------------------------------- |
| `@wolf-tui/core` | Peer — DOM nodes, layout, `Styles` type            |
| `cfonts`         | ASCII-font rendering for `renderBigText` (GPL-3.0) |
| `chalk`          | Peer — terminal color output                       |
| `cli-spinners`   | Spinner animation frames                           |
| `es-toolkit`     | Utility functions                                  |
| `figures`        | Unicode symbols (checkmarks, arrows, etc.)         |

## License

MIT, with the following third-party runtime dependency carrying a copyleft license:

- `cfonts` is **GPL-3.0-or-later**. It is only pulled in when consumers use `renderBigText` (or the adapter-level `BigText` component). Downstream projects that ship `renderBigText` must comply with GPL-3.0-or-later for that portion of their bundle.
