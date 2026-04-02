# @wolf-tui/solid

### Build terminal UIs with SolidJS — fine-grained reactivity, no Virtual DOM

[![SolidJS 1.9+](https://img.shields.io/badge/solid--js-%5E1.9.0-4f88c6)](https://www.solidjs.com)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

[Install](#install) · [Quick Start](#quick-start) · [Components](#components) · [Composables](#composables) · [Theming](#theming) · [CSS Styling](#css-styling)

---

## The Problem

SolidJS has no terminal rendering target. If you want to build CLI apps with Solid's signal-based reactivity and JSX syntax, you need a custom renderer built on `solid-js/universal`.

This package provides that renderer, plus 20+ components (inputs, selects, alerts, spinners, progress bars, lists) and composables (`useInput`, `useFocus`, etc.) — all using Solid's fine-grained reactivity with `createSignal`, `createEffect`, `createMemo`.

If you've used [Ink](https://github.com/vadimdemedes/ink) for React terminal UIs, this is the Solid equivalent. It uses the same layout engine (Taffy) and shared render functions as wolf-tui's React, Vue, Angular, and Svelte adapters.

---

## Install

### Scaffold a new project (recommended)

```bash
npm create wolf-tui -- --framework solid
```

Generates a complete project with bundler config, TypeScript, and optional CSS tooling. See [create-wolf-tui](../create-wolf-tui/README.md).

### Manual setup

```bash
# Runtime dependencies
pnpm add @wolf-tui/solid solid-js

# Build tooling (pick one)
pnpm add -D @wolf-tui/plugin vite vite-plugin-solid
# or
pnpm add -D @wolf-tui/plugin esbuild esbuild-plugin-solid
```

| Peer dependency | Version |
| --------------- | ------- |
| `solid-js`      | ^1.9.0  |

---

## Quick Start

```tsx
import { render, Box, Text, useInput, useApp } from '@wolf-tui/solid'
import { createSignal } from 'solid-js'

function App() {
	const [count, setCount] = createSignal(0)
	const { exit } = useApp()

	useInput((input, key) => {
		if (key.upArrow) setCount((c) => c + 1)
		if (key.downArrow) setCount((c) => Math.max(0, c - 1))
		if (input === 'q') exit()
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ color: 'green', fontWeight: 'bold' }}>
				Counter: {count()}
			</Text>
			<Text style={{ color: 'gray' }}>↑/↓ to change, q to quit</Text>
		</Box>
	)
}

// Pass the function reference — not <App />
render(App)
```

> For CSS class-based styling (`className="text-green p-1"`), see [CSS Styling](#css-styling).

### TypeScript Setup

```json
// tsconfig.json
{
	"compilerOptions": {
		"jsx": "preserve",
		"jsxImportSource": "solid-js"
	}
}
```

### Vite Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { wolfie } from '@wolf-tui/plugin/vite'
import { builtinModules } from 'node:module'

const nodeBuiltins = [
	...builtinModules,
	...builtinModules.map((m) => `node:${m}`),
]

export default defineConfig({
	plugins: [
		solidPlugin({
			solid: {
				// Use wolf-tui's universal renderer instead of browser DOM
				moduleName: '@wolf-tui/solid/renderer',
				generate: 'universal',
			},
		}),
		wolfie('solid'),
	],
	resolve: {
		// Prevent Node from resolving solid-js to its server build
		alias: { 'solid-js': '@wolf-tui/solid' },
	},
	build: {
		target: 'node18',
		lib: {
			entry: 'src/index.tsx',
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			external: (id) =>
				id === '@wolf-tui/solid' ||
				id.startsWith('@wolf-tui/solid/') ||
				nodeBuiltins.includes(id),
		},
	},
})
```

<details>
<summary><b>esbuild / webpack configs</b></summary>

**esbuild:**

```ts
// build.mjs
import * as esbuild from 'esbuild'
import { wolfie, generateNativeBanner } from '@wolf-tui/plugin/esbuild'
import { solidPlugin } from 'esbuild-plugin-solid'

await esbuild.build({
	entryPoints: ['src/index.tsx'],
	bundle: true,
	outfile: 'dist/index.cjs',
	platform: 'node',
	format: 'cjs',
	external: ['solid-js', '@wolf-tui/solid'],
	banner: { js: generateNativeBanner('cjs') },
	plugins: [
		solidPlugin({
			solid: {
				generate: 'universal',
				moduleName: '@wolf-tui/solid/renderer',
			},
		}),
		wolfie('solid'),
	],
})
```

**webpack:**

```js
// webpack.config.js
import { wolfie } from '@wolf-tui/plugin/webpack'

export default {
	target: 'node',
	entry: './src/index.tsx',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'babel-preset-solid',
								{
									generate: 'universal',
									moduleName: '@wolf-tui/solid/renderer',
								},
							],
							'@babel/preset-typescript',
						],
					},
				},
				exclude: /node_modules/,
			},
		],
	},
	plugins: [wolfie('solid')],
}
```

See `examples/solid_webpack/` for a complete setup with native binding resolution.

</details>

---

## `render(component, options?)`

Mounts a Solid component to the terminal. First argument is a **component function**, not a JSX element.

```tsx
const instance = render(App, {
	stdout: process.stdout,
	stdin: process.stdin,
	maxFps: 30,
})

instance.unmount()
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

**Box style properties** (passed via `style`):

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

**Text style properties** (passed via `style`):

| Property          | Type                                     | Description      |
| ----------------- | ---------------------------------------- | ---------------- |
| `color`           | `string`                                 | Text color       |
| `backgroundColor` | `string`                                 | Background color |
| `fontWeight`      | `'bold'`                                 | Bold text        |
| `fontStyle`       | `'italic'`                               | Italic text      |
| `textDecoration`  | `'underline' \| 'line-through'`          | Decoration       |
| `inverse`         | `boolean`                                | Inverse colors   |
| `textWrap`        | `'wrap' \| 'truncate' \| 'truncate-end'` | Wrap mode        |

</details>

### Display

| Component         | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `<Alert>`         | Styled alert box — `variant` + `title`, children as message |
| `<Badge>`         | Inline colored badge — `color`, children as label           |
| `<Spinner>`       | Animated spinner with `label`                               |
| `<ProgressBar>`   | Progress bar (value 0–100)                                  |
| `<StatusMessage>` | Status with icon — `variant`, children as message           |
| `<ErrorOverview>` | Formatted error display with stack trace                    |

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

```tsx
// Alert (children as message)
<Alert variant="success" title="Deployed">
  All services are running.
</Alert>

// Badge (children as label)
<Badge color="green">NEW</Badge>

// StatusMessage (children as message)
<StatusMessage variant="success">Saved!</StatusMessage>

// TextInput
<TextInput
  placeholder="Your name..."
  onChange={(value) => console.log(value)}
  onSubmit={(value) => console.log('done:', value)}
/>

// Select (options as prop, not child components)
<Select
  options={[
    { label: 'TypeScript', value: 'ts' },
    { label: 'JavaScript', value: 'js' },
  ]}
  onChange={(value) => console.log('Picked:', value)}
/>

// ProgressBar (0–100, not 0–1)
<ProgressBar value={75} />

// Spinner
<Spinner label="Loading..." />

// Lists
<OrderedList>
  <OrderedListItem>First</OrderedListItem>
  <OrderedListItem>Second</OrderedListItem>
</OrderedList>
```

</details>

---

## Composables

### `useInput(handler, options?)`

Handle keyboard input. Registers immediately (no `onMount` needed).

```tsx
import { useInput } from '@wolf-tui/solid'

function App() {
	useInput((input, key) => {
		if (key.upArrow) {
			/* move up */
		}
		if (key.return) {
			/* confirm */
		}
		if (input === 'q') {
			/* quit */
		}
	})

	return <Text>Press q to quit</Text>
}
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
| `pageUp`     | `boolean` | Page Up pressed     |
| `pageDown`   | `boolean` | Page Down pressed   |
| `home`       | `boolean` | Home pressed        |
| `end`        | `boolean` | End pressed         |

The `isActive` option accepts `() => boolean` (accessor) to conditionally enable/disable input.

</details>

### `useApp()`

Access the app context — primarily for `exit()`.

```tsx
const { exit } = useApp()
```

### `useFocus(options?)` / `useFocusManager()`

Make components focusable and control focus programmatically. `isFocused` returns a **signal accessor** — call it as `isFocused()`.

```tsx
const { isFocused } = useFocus({ autoFocus: true })
const { focusNext, focusPrevious } = useFocusManager()

// In JSX: isFocused() not isFocused
<Text>{isFocused() ? 'Focused!' : 'Not focused'}</Text>
```

### Stream access

| Composable                   | Returns                                     |
| ---------------------------- | ------------------------------------------- |
| `useStdin()`                 | `{ stdin, setRawMode, isRawModeSupported }` |
| `useStdout()`                | `{ stdout, write }`                         |
| `useStderr()`                | `{ stderr, write }`                         |
| `useIsScreenReaderEnabled()` | `boolean`                                   |

<details>
<summary><b>useSpinner + headless composables</b></summary>

**useSpinner** — spinner frame animation (returns signal accessor):

```tsx
const { frame } = useSpinner({ type: 'dots' })
return <Text>{frame()} Loading...</Text>
```

**Headless composables** for building custom input UIs:

| Composable              | Description                 |
| ----------------------- | --------------------------- |
| `useTextInputState()`   | Reactive text input state   |
| `useSelectState()`      | Reactive select state       |
| `useMultiSelectState()` | Reactive multi-select state |

</details>

---

## Theming

Customize component appearance via the `theme` option in `render()`:

```tsx
import { render, extendTheme, defaultTheme } from '@wolf-tui/solid'

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

| Method        | Usage                                  |
| ------------- | -------------------------------------- |
| Inline styles | `style={{ color: 'green' }}`           |
| Tailwind CSS  | `className="text-green p-1"` + PostCSS |
| CSS Modules   | `className={styles.box}`               |

All CSS approaches resolve to terminal styles at build time — no runtime CSS engine.

<details>
<summary><b>Styling examples</b></summary>

**Tailwind CSS:**

```tsx
import './styles.css'
;<Box className="flex-col p-4 gap-2">
	<Text className="text-green-500 font-bold">Tailwind styled</Text>
</Box>
```

**CSS Modules:**

```tsx
import styles from './App.module.css'
;<Box className={styles.container}>
	<Text className={styles.title}>CSS Modules</Text>
</Box>
```

</details>

---

## Key Differences from React

| Aspect        | React                      | Solid                                   |
| ------------- | -------------------------- | --------------------------------------- |
| Render call   | `render(<App />)`          | `render(App)` — function reference      |
| State         | `useState` (returns value) | `createSignal` (returns `[get, set]`)   |
| Reading state | `count`                    | `count()` — call the accessor           |
| Props         | Destructure freely         | Use `splitProps` (preserves reactivity) |
| Focus state   | `isFocused` (boolean)      | `isFocused()` (signal accessor)         |

---

## Part of wolf-tui

This is the Solid adapter for [wolf-tui](../../README.md) — a framework-agnostic terminal UI library. The same layout engine (Taffy/flexbox) and component render functions power adapters for React, Vue, Angular, and Svelte.

<details>
<summary><b>Bundler examples</b></summary>

| Bundler | Example                   |
| ------- | ------------------------- |
| esbuild | `examples/solid_esbuild/` |
| webpack | `examples/solid_webpack/` |

</details>

## License

MIT
