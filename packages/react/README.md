# @wolf-tui/react

### Build terminal UIs with React — flexbox layouts, styled components, keyboard input

[![React 19+](https://img.shields.io/badge/react-%3E%3D19.0.0-61dafb)](https://react.dev)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

[Install](#install) · [Quick Start](#quick-start) · [Components](#components) · [Hooks](#hooks) · [Theming](#theming) · [CSS Styling](#css-styling)

---

## The Problem

React terminal UI libraries exist ([Ink](https://github.com/vadimdemedes/ink)), but wolf-tui's React adapter shares a layout engine and component library with Vue, Angular, Solid, and Svelte adapters. Same components, same Taffy-powered Flexbox + CSS Grid, same styling pipeline — across all five frameworks.

This package started as a fork of Ink, extended with the wolf-tui shared architecture, React Compiler integration, and the full `@wolf-tui/plugin` styling pipeline (Tailwind, SCSS, CSS Modules).

---

## Install

### Scaffold a new project (recommended)

```bash
npm create wolf-tui -- --framework react
```

Generates a complete project with bundler config, TypeScript, and optional CSS tooling. See [create-wolf-tui](../create-wolf-tui/README.md).

### Manual setup

```bash
# Runtime dependencies
pnpm add @wolf-tui/react react

# Build tooling
pnpm add -D @wolf-tui/plugin @vitejs/plugin-react vite
```

| Peer dependency | Version   |
| --------------- | --------- |
| `react`         | >= 19.0.0 |

---

## Quick Start

```tsx
import { render, Box, Text, useInput, useApp } from '@wolf-tui/react'
import { useState } from 'react'

function App() {
	const [count, setCount] = useState(0)
	const { exit } = useApp()

	useInput((input, key) => {
		if (key.upArrow) setCount((c) => c + 1)
		if (key.downArrow) setCount((c) => Math.max(0, c - 1))
		if (input === 'q') exit()
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ color: 'green', fontWeight: 'bold' }}>
				Counter: {count}
			</Text>
			<Text style={{ color: 'gray' }}>↑/↓ to change, q to quit</Text>
		</Box>
	)
}

render(<App />)
```

> For CSS class-based styling (`className="text-green p-1"`), see [CSS Styling](#css-styling).

---

## `render(element, options?)`

Mounts a React element to the terminal.

```tsx
const { rerender, unmount, waitUntilExit, clear } = render(<App />)

rerender(<App count={1} />) // Re-render with new props
unmount() // Unmount and exit
await waitUntilExit() // Wait for app to exit
clear() // Clear terminal output
```

| Option                  | Type                 | Default          | Description               |
| ----------------------- | -------------------- | ---------------- | ------------------------- |
| `stdout`                | `NodeJS.WriteStream` | `process.stdout` | Output stream             |
| `stdin`                 | `NodeJS.ReadStream`  | `process.stdin`  | Input stream              |
| `stderr`                | `NodeJS.WriteStream` | `process.stderr` | Error stream              |
| `debug`                 | `boolean`            | `false`          | Disable frame throttling  |
| `exitOnCtrlC`           | `boolean`            | `true`           | Exit on Ctrl+C            |
| `patchConsole`          | `boolean`            | `true`           | Patch console methods     |
| `maxFps`                | `number`             | `30`             | Maximum render frequency  |
| `isScreenReaderEnabled` | `boolean`            | env-based        | Screen reader mode        |
| `incrementalRendering`  | `boolean`            | `false`          | Only update changed lines |

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
| `flexBasis`      | `number \| string`                                                            | Flex basis          |
| `alignItems`     | `'flex-start' \| 'center' \| 'flex-end' \| 'stretch'`                         | Cross-axis          |
| `alignSelf`      | `'flex-start' \| 'center' \| 'flex-end' \| 'auto'`                            | Self alignment      |
| `justifyContent` | `'flex-start' \| 'center' \| 'flex-end' \| 'space-between' \| 'space-around'` | Main-axis           |
| `gap`            | `number`                                                                      | Gap between items   |
| `width`          | `number \| string`                                                            | Width               |
| `height`         | `number \| string`                                                            | Height              |
| `padding`        | `number`                                                                      | Padding (all sides) |
| `paddingX`       | `number`                                                                      | Horizontal padding  |
| `paddingY`       | `number`                                                                      | Vertical padding    |
| `margin`         | `number`                                                                      | Margin (all sides)  |
| `marginX`        | `number`                                                                      | Horizontal margin   |
| `marginY`        | `number`                                                                      | Vertical margin     |
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

| Component         | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `<Alert>`         | Styled alert box — `variant`: `success`, `error`, `warning`, `info` |
| `<Badge>`         | Inline colored badge                                                |
| `<Spinner>`       | Animated spinner with `type`                                        |
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

// Select
<Select
  options={[
    { label: 'TypeScript', value: 'ts' },
    { label: 'JavaScript', value: 'js' },
  ]}
  onChange={(value) => console.log('Picked:', value)}
/>

// ProgressBar
<ProgressBar value={75} />

// Spinner
<Spinner type="dots" label="Loading..." />

// Lists
<OrderedList>
  <OrderedListItem>First</OrderedListItem>
  <OrderedListItem>Second</OrderedListItem>
</OrderedList>
```

</details>

---

## Hooks

### `useInput(handler, options?)`

Handle keyboard input.

```tsx
import { useInput } from '@wolf-tui/react'

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

The `isActive` option (`boolean`) enables/disables input handling.

</details>

### `useApp()`

Access the app context — primarily for `exit()`.

```tsx
const { exit } = useApp()
```

### `useFocus(options?)` / `useFocusManager()`

Make components focusable and control focus programmatically.

```tsx
const { isFocused } = useFocus({ autoFocus: true })
const { focusNext, focusPrevious } = useFocusManager()
```

### Stream access

| Hook                         | Returns                                     |
| ---------------------------- | ------------------------------------------- |
| `useStdin()`                 | `{ stdin, setRawMode, isRawModeSupported }` |
| `useStdout()`                | `{ stdout, write }`                         |
| `useStderr()`                | `{ stderr, write }`                         |
| `useIsScreenReaderEnabled()` | `boolean`                                   |

<details>
<summary><b>useSpinner</b></summary>

Spinner animation hook for building custom spinners:

```tsx
import { useSpinner } from '@wolf-tui/react'

function Loading() {
	const { frame } = useSpinner({ type: 'dots' })
	return <Text>{frame} Loading...</Text>
}
```

</details>

---

## Theming

Customize component appearance via `ThemeProvider`:

```tsx
import {
	render,
	ThemeProvider,
	extendTheme,
	defaultTheme,
} from '@wolf-tui/react'

const theme = extendTheme(defaultTheme, {
	components: {
		Spinner: { styles: { spinner: { color: 'cyan' } } },
		Alert: { styles: { container: { borderColor: 'blue' } } },
	},
})

render(
	<ThemeProvider theme={theme}>
		<App />
	</ThemeProvider>
)
```

| Export                         | Description                                    |
| ------------------------------ | ---------------------------------------------- |
| `ThemeProvider`                | React context provider for theme               |
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

## React Compiler

`@wolf-tui/react` ships pre-compiled with the [React Compiler](https://react.dev/learn/react-compiler) — all library components skip re-renders when props haven't changed. To apply the same optimization to your own components:

```bash
pnpm add -D babel-plugin-react-compiler
```

```tsx
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { wolfie } from '@wolf-tui/plugin/vite'

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler', {}]],
			},
		}),
		wolfie('react'),
	],
})
```

Requires React 19+.

---

## Part of wolf-tui

This is the React adapter for [wolf-tui](../../README.md) — a framework-agnostic terminal UI library. The same layout engine (Taffy/flexbox) and component render functions power adapters for Vue, Angular, Solid, and Svelte.

<details>
<summary><b>Bundler examples</b></summary>

The `examples/` directory has working setups for each bundler:

| Bundler | Example                   |
| ------- | ------------------------- |
| Vite    | `examples/react_vite/`    |
| esbuild | `examples/react_esbuild/` |
| webpack | `examples/react_webpack/` |

</details>

## License

MIT
