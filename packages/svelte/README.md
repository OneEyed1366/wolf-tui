# @wolf-tui/svelte

### Build terminal UIs with Svelte 5 — flexbox layouts, styled components, keyboard input

[![Svelte 5](https://img.shields.io/badge/svelte-%5E5.0.0-FF3E00)](https://svelte.dev)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

[Install](#install) · [Quick Start](#quick-start) · [Components](#components) · [Composables](#composables) · [Theming](#theming) · [CSS Styling](#css-styling) · [Architecture](#architecture)

---

> [!IMPORTANT]
> **What this package touches:**
>
> - Patches `globalThis.Node`, `globalThis.Element`, `globalThis.Text`, `globalThis.Comment`, and `globalThis.document` with a virtual DOM shim (Svelte 5 has no custom renderer API — this is the only way to intercept its DOM calls)
> - Restores all globals on `unmount()`
> - No network calls, no telemetry, no file writes outside your project
>
> **Disable instantly:** call `instance.unmount()` or remove the `render()` call.
> **Uninstall:** `pnpm remove @wolf-tui/svelte @wolf-tui/plugin`

## The Problem

Svelte 5 compiles components to direct `document.createElement()` / `.appendChild()` calls. There's no `createRenderer()` hook like Vue or Solid offer. If you want Svelte components to render into a terminal instead of a browser, you need a complete DOM shim that Svelte's compiled output can call transparently.

This package provides that shim, plus 20+ components (inputs, selects, alerts, spinners, progress bars, lists) and composables (`useInput`, `useFocus`, etc.) — all using Svelte 5 runes (`$state`, `$derived`, `$effect`).

If you've used [Ink](https://github.com/vadimdemedes/ink) for React terminal UIs, this is the Svelte equivalent. What's new is the DOM shim approach — a class hierarchy (`WolfieNode` → `WolfieElement` → `WolfieText`) that satisfies Svelte's `init_operations()` prototype introspection, so compiled Svelte code runs unmodified.

---

## Install

### Scaffold a new project (recommended)

```bash
npm create wolf-tui -- --framework svelte
```

Generates a complete project with bundler config, TypeScript, and optional CSS tooling. See [create-wolf-tui](../create-wolf-tui/README.md).

### Manual setup

```bash
# Runtime dependencies
pnpm add @wolf-tui/svelte svelte

# Build tooling
pnpm add -D @wolf-tui/plugin @sveltejs/vite-plugin-svelte vite
```

| Peer dependency | Version |
| --------------- | ------- |
| `svelte`        | ^5.0.0  |

---

## Quick Start

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { Box, Text, useInput, useApp } from '@wolf-tui/svelte'

  let count = $state(0)
  const { exit } = useApp()

  useInput((input, key) => {
    if (key.upArrow) count++
    if (key.downArrow) count = Math.max(0, count - 1)
    if (input === 'q') exit()
  })
</script>

<Box style={{ flexDirection: 'column', padding: 1 }}>
  <Text style={{ color: 'green', fontWeight: 'bold' }}>Counter: {count}</Text>
  <Text style={{ color: 'gray' }}>↑/↓ to change, q to quit</Text>
</Box>
```

> For CSS class-based styling (`className="text-green p-1"`), see [CSS Styling](#css-styling).

```ts
// index.ts
import { render } from '@wolf-tui/svelte'
import App from './App.svelte'

render(App, { maxFps: 30 })
```

### Vite Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { wolfie } from '@wolf-tui/plugin/vite'
import { wolfiePreprocess } from '@wolf-tui/plugin/svelte'
import { builtinModules } from 'node:module'

const nodeBuiltins = [
	...builtinModules,
	...builtinModules.map((m) => `node:${m}`),
]

export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: { css: 'external' },
			preprocess: [vitePreprocess(), wolfiePreprocess()],
			dynamicCompileOptions() {
				return { generate: 'client' }
			},
		}),
		wolfie('svelte'),
	],
	resolve: { conditions: ['browser', 'development'] },
	build: {
		target: 'node18',
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			external: (id) =>
				nodeBuiltins.includes(id) ||
				id === '@wolf-tui/svelte' ||
				id.startsWith('@wolf-tui/svelte/') ||
				id === 'svelte' ||
				id.startsWith('svelte/'),
		},
	},
})
```

### Running

Build, then run with `--conditions=browser` so Node resolves Svelte to its client build:

```bash
vite build && node --conditions=browser dist/index.js
```

> [!NOTE]
> **Why not `vite-node`?** It creates separate instances of `svelte/internal/client` for `.svelte` vs `.svelte.ts` files, breaking `$state` reactivity across modules. The build-then-run approach produces a single bundle with one Svelte runtime instance.

---

## `render(component, options?)`

Mounts a Svelte component to the terminal.

```ts
const instance = render(App, {
	stdout: process.stdout,
	stdin: process.stdin,
	maxFps: 30,
})
```

| Option                  | Type                 | Default          | Description              |
| ----------------------- | -------------------- | ---------------- | ------------------------ |
| `stdout`                | `NodeJS.WriteStream` | `process.stdout` | Output stream            |
| `stdin`                 | `NodeJS.ReadStream`  | `process.stdin`  | Input stream             |
| `stderr`                | `NodeJS.WriteStream` | `process.stderr` | Error stream             |
| `maxFps`                | `number`             | `30`             | Maximum render frequency |
| `debug`                 | `boolean`            | `false`          | Disable frame throttling |
| `isScreenReaderEnabled` | `boolean`            | env-based        | Screen reader mode       |
| `theme`                 | `ITheme`             | `{}`             | Component theming        |

---

## Components

### Layout

| Component     | Description                                           |
| ------------- | ----------------------------------------------------- |
| `<Box>`       | Flexbox container — `style` or `className` for layout |
| `<Text>`      | Styled text — color, bold, underline, etc             |
| `<Newline>`   | Empty lines (`count` prop)                            |
| `<Spacer>`    | Fills available flex space                            |
| `<Static>`    | Renders items once (no re-renders)                    |
| `<Transform>` | Applies string transform to children                  |

<details>
<summary><b>Box & Text props</b></summary>

Both accept `style` (inline object) and `className` (CSS classes via `@wolf-tui/plugin`).

**Box style properties:**

| Property         | Type                                                                          | Description         |
| ---------------- | ----------------------------------------------------------------------------- | ------------------- |
| `flexDirection`  | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'`                      | Flex direction      |
| `flexWrap`       | `'wrap' \| 'nowrap' \| 'wrap-reverse'`                                        | Flex wrap           |
| `flexGrow`       | `number`                                                                      | Grow factor         |
| `flexShrink`     | `number`                                                                      | Shrink factor       |
| `alignItems`     | `'flex-start' \| 'center' \| 'flex-end' \| 'stretch'`                         | Cross-axis          |
| `justifyContent` | `'flex-start' \| 'center' \| 'flex-end' \| 'space-between' \| 'space-around'` | Main-axis           |
| `gap`            | `number`                                                                      | Gap between items   |
| `width`          | `number \| string`                                                            | Width               |
| `height`         | `number \| string`                                                            | Height              |
| `padding`        | `number`                                                                      | Padding (all sides) |
| `margin`         | `number`                                                                      | Margin (all sides)  |
| `borderStyle`    | `'single' \| 'double' \| 'round' \| 'classic'`                                | Border style        |
| `borderColor`    | `string`                                                                      | Border color        |
| `overflow`       | `'visible' \| 'hidden'`                                                       | Overflow behavior   |

</details>

### Display

| Component         | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `<Alert>`         | Styled alert box — `variant`: `success`, `error`, `warning`, `info` |
| `<Badge>`         | Inline colored badge                                                |
| `<Spinner>`       | Animated spinner with `label`                                       |
| `<ProgressBar>`   | Progress bar (value 0–100)                                          |
| `<StatusMessage>` | Status with icon — `variant`: `success`, `error`, `warning`, `info` |
| `<ErrorOverview>` | Formatted error display with stack trace                            |

### Input

| Component         | Description                             |
| ----------------- | --------------------------------------- |
| `<TextInput>`     | Text field with `onChange` / `onSubmit` |
| `<PasswordInput>` | Masked text input                       |
| `<EmailInput>`    | Email input with domain suggestions     |
| `<ConfirmInput>`  | Yes/No prompt                           |
| `<Select>`        | Single selection from `options` array   |
| `<MultiSelect>`   | Multiple selection from `options` array |

### Lists

| Component         | Description   |
| ----------------- | ------------- |
| `<OrderedList>`   | Numbered list |
| `<UnorderedList>` | Bulleted list |

<details>
<summary><b>Component examples</b></summary>

```svelte
<!-- Alert -->
<Alert variant="success" title="Deployed" message="All services are running." />

<!-- TextInput -->
<TextInput
  placeholder="Your name..."
  onChange={(value) => console.log(value)}
  onSubmit={(value) => console.log('Submitted:', value)}
/>

<!-- Select -->
<Select
  options={[
    { label: 'TypeScript', value: 'ts' },
    { label: 'JavaScript', value: 'js' },
  ]}
  onChange={(value) => console.log('Picked:', value)}
/>

<!-- ProgressBar -->
<ProgressBar value={75} />

<!-- Spinner -->
<Spinner label="Deploying..." />
```

</details>

---

## Composables

### `useInput(handler, options?)`

Handle keyboard input. Available inside any component rendered by `render()`.

```svelte
<script lang="ts">
  import { useInput } from '@wolf-tui/svelte'

  useInput((input, key) => {
    if (key.upArrow) { /* move up */ }
    if (key.return) { /* confirm */ }
    if (input === 'q') { /* quit */ }
  })
</script>
```

<details>
<summary><b>Key object properties</b></summary>

| Property     | Type      | Description         |
| ------------ | --------- | ------------------- |
| `upArrow`    | `boolean` | Up arrow pressed    |
| `downArrow`  | `boolean` | Down arrow pressed  |
| `leftArrow`  | `boolean` | Left arrow pressed  |
| `rightArrow` | `boolean` | Right arrow pressed |
| `return`     | `boolean` | Enter pressed       |
| `escape`     | `boolean` | Escape pressed      |
| `ctrl`       | `boolean` | Ctrl held           |
| `shift`      | `boolean` | Shift held          |
| `meta`       | `boolean` | Meta key held       |
| `tab`        | `boolean` | Tab pressed         |
| `backspace`  | `boolean` | Backspace pressed   |
| `delete`     | `boolean` | Delete pressed      |

The `isActive` option accepts an accessor `() => boolean` to conditionally enable/disable input.

</details>

### `useApp()`

Access the app context — primarily for `exit()`.

```svelte
<script>
  import { useApp } from '@wolf-tui/svelte'
  const { exit } = useApp()
</script>
```

### `useFocus(options?)` / `useFocusManager()`

Make components focusable and control focus programmatically.

```svelte
<script>
  import { useFocus, useFocusManager } from '@wolf-tui/svelte'

  const { isFocused } = useFocus()
  const { focusNext, focusPrevious } = useFocusManager()
</script>
```

### Stream access

| Composable                   | Returns                                     |
| ---------------------------- | ------------------------------------------- |
| `useStdin()`                 | `{ stdin, setRawMode, isRawModeSupported }` |
| `useStdout()`                | `{ stdout, write }`                         |
| `useStderr()`                | `{ stderr, write }`                         |
| `useIsScreenReaderEnabled()` | `boolean`                                   |

<details>
<summary><b>Headless composables</b> — build custom input UIs</summary>

Each input component is backed by a headless composable that manages state and keyboard handling. Use these to build custom input UIs with your own rendering:

| Composable                 | Description                               |
| -------------------------- | ----------------------------------------- |
| `useTextInput(props)`      | Cursor, value, onChange/onSubmit handling |
| `useTextInputState(props)` | Reactive text input state ($state-based)  |
| `usePasswordInput(props)`  | Masked input with show/hide toggle        |
| `usePasswordInputState()`  | Reactive password state                   |
| `useEmailInput(props)`     | Email with domain autocomplete            |
| `useEmailInputState()`     | Reactive email state                      |
| `useSelect(props)`         | Single-selection keyboard navigation      |
| `useSelectState(props)`    | Reactive select state                     |
| `useMultiSelect(props)`    | Multi-selection with toggle               |
| `useMultiSelectState()`    | Reactive multi-select state               |
| `useSpinner(props)`        | Spinner frame animation                   |

```svelte
<script lang="ts">
  import { useTextInputState, useTextInput, Box, Text } from '@wolf-tui/svelte'

  // Step 1: create reactive state (holds value, cursor, callbacks)
  const state = useTextInputState({
    onChange: (val) => console.log(val),
    onSubmit: (val) => console.log('done:', val),
  })

  // Step 2: wire keyboard handling + rendered value
  const { inputValue } = useTextInput({ state, placeholder: 'Type here...' })
</script>

<Box>
  <Text>Custom input: {inputValue()}</Text>
</Box>
```

</details>

---

## Theming

Customize component appearance via the `theme` option in `render()`:

```ts
import { render, extendTheme, defaultTheme } from '@wolf-tui/svelte'

const theme = extendTheme(defaultTheme, {
	components: {
		Spinner: { styles: { spinner: { color: 'cyan' } } },
		Alert: { styles: { container: { borderColor: 'blue' } } },
	},
})

render(App, { theme })
```

| Export                         | Description                                    |
| ------------------------------ | ---------------------------------------------- |
| `extendTheme(base, overrides)` | Deep-merge overrides into base theme           |
| `defaultTheme`                 | Base theme object                              |
| `useComponentTheme(name)`      | Read theme for a component (inside components) |

---

## CSS Styling

Three approaches, all via `@wolf-tui/plugin`:

| Method       | Setup                             | Usage                        |
| ------------ | --------------------------------- | ---------------------------- |
| Tailwind CSS | PostCSS + `wolfiePreprocess()`    | `className="text-green p-1"` |
| CSS Modules  | `*.module.css` imports            | `className={styles.box}`     |
| SCSS/LESS    | Preprocessor + `wolfie('svelte')` | `className="my-class"`       |

All resolve to inline terminal styles at build time — no runtime CSS engine.

---

## Architecture

Svelte 5 compiles to direct DOM API calls (`document.createElement()`, `.appendChild()`, etc.). Unlike Vue/Solid, there's no `createRenderer()` hook. This adapter intercepts those calls by patching `globalThis` with a virtual DOM hierarchy:

```
globalThis.Node      → WolfieNode       (firstChild, nextSibling, remove, before, after)
globalThis.Element   → WolfieElement    (appendChild, insertBefore, removeChild, append)
globalThis.Text      → WolfieText       (nodeValue getter/setter)
globalThis.Comment   → WolfieComment    (anchor nodes for {#if}/{#each})
globalThis.document  → WolfieDocument   (createElement, createTextNode, etc.)
```

<details>
<summary><b>Why globalThis patching?</b></summary>

Svelte's `init_operations()` caches property getters via `Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild')`. By assigning `WolfieNode` directly to `globalThis.Node`, the prototype getters are found correctly — Svelte's compiled code runs without modification.

The `wolfieProps` Svelte action handles style objects and function props that Svelte's `set_custom_element_data()` would otherwise stringify.

All patches are reversed when `unmount()` is called via `restoreGlobals()`.

</details>

<details>
<summary><b>Bundler examples (esbuild, webpack)</b></summary>

The `examples/` directory has working setups for each bundler:

| Bundler | Example                    |
| ------- | -------------------------- |
| Vite    | `examples/svelte_vite/`    |
| esbuild | `examples/svelte_esbuild/` |
| webpack | `examples/svelte_webpack/` |

All follow the same pattern: compile `.svelte` → extract CSS → bundle for Node → run with `--conditions=browser`.

</details>

---

## Part of wolf-tui

This is the Svelte adapter for [wolf-tui](../../README.md) — a framework-agnostic terminal UI library. The same layout engine (Taffy/flexbox) and component render functions power adapters for React, Vue, Angular, and Solid.

## License

MIT
