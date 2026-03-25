# @wolf-tui/vue

### Build terminal UIs with Vue 3 — flexbox layouts, styled components, keyboard input

[![Vue 3.5+](https://img.shields.io/badge/vue-%5E3.5.0-42b883)](https://vuejs.org)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

[Install](#install) · [Quick Start](#quick-start) · [Components](#components) · [Composables](#composables) · [Theming](#theming) · [CSS Styling](#css-styling)

---

## The Problem

Vue has no terminal rendering target. If you want to build CLI apps with Vue's Composition API and SFC syntax, you need a custom renderer that maps Vue's virtual DOM to terminal output.

This package provides that renderer, plus 20+ components (inputs, selects, alerts, spinners, progress bars, lists) and composables (`useInput`, `useFocus`, etc.) — all using Vue 3's Composition API.

If you've used [Ink](https://github.com/vadimdemedes/ink) for React terminal UIs, this is the Vue equivalent. It uses the same layout engine (Taffy) and shared render functions as wolf-tui's React, Angular, Solid, and Svelte adapters.

---

## Install

```bash
# Runtime dependencies
pnpm add @wolf-tui/vue chalk vue

# Build tooling
pnpm add -D @wolf-tui/plugin @vitejs/plugin-vue vite
```

| Peer dependency | Version |
| --------------- | ------- |
| `vue`           | ^3.5.0  |
| `chalk`         | ^5.0.0  |

---

## Quick Start

### SFC (Single File Components)

```vue
<!-- App.vue -->
<script setup>
import { Box, Text, useInput, useApp } from '@wolf-tui/vue'
import { ref } from 'vue'

const count = ref(0)
const { exit } = useApp()

useInput((input, key) => {
	if (key.upArrow) count.value++
	if (key.downArrow) count.value = Math.max(0, count.value - 1)
	if (input === 'q') exit()
})
</script>

<template>
	<Box :style="{ flexDirection: 'column', padding: 1 }">
		<Text :style="{ color: 'green', fontWeight: 'bold' }"
			>Counter: {{ count }}</Text
		>
		<Text :style="{ color: 'gray' }">↑/↓ to change, q to quit</Text>
	</Box>
</template>
```

```ts
// index.ts
import { render } from '@wolf-tui/vue'
import App from './App.vue'

render(App)
```

> For CSS class-based styling (`class="text-green p-1"`), see [CSS Styling](#css-styling).

### Vite Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wolfie } from '@wolf-tui/plugin/vite'

export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					// wolf-tui uses custom elements internally — tell Vue not to resolve them
					isCustomElement: (tag) => tag.startsWith('wolfie-'),
					hoistStatic: false,
				},
			},
		}),
		wolfie('vue'),
	],
	build: {
		lib: {
			entry: 'src/index.ts',
			formats: ['cjs'],
			fileName: 'index',
		},
		rollupOptions: {
			external: [/^vue(\/|$)/, /^@wolf-tui\//],
		},
	},
})
```

```bash
vite build && node dist/index.cjs
```

<details>
<summary><b>JSX/TSX alternative</b></summary>

```tsx
import { defineComponent, ref } from '@wolf-tui/vue'
import { Box, Text, render, useInput, useApp } from '@wolf-tui/vue'

const App = defineComponent({
	setup() {
		const count = ref(0)
		const { exit } = useApp()

		useInput((input, key) => {
			if (key.upArrow) count.value++
			if (input === 'q') exit()
		})

		return () => (
			<Box style={{ flexDirection: 'column', padding: 1 }}>
				<Text style={{ color: 'green', fontWeight: 'bold' }}>
					Counter: {count.value}
				</Text>
			</Box>
		)
	},
})

render(App)
```

</details>

---

## `render(component, options?)`

Mounts a Vue component to the terminal.

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

| Component     | Description                                       |
| ------------- | ------------------------------------------------- |
| `<Box>`       | Flexbox container — `style` or `class` for layout |
| `<Text>`      | Styled text — color, bold, underline, etc         |
| `<Newline>`   | Empty lines (`:count` prop)                       |
| `<Spacer>`    | Fills available flex space                        |
| `<Static>`    | Renders items once (no re-renders)                |
| `<Transform>` | Applies string transform to children              |

<details>
<summary><b>Box & Text props</b></summary>

Both accept `style` (inline object) and `class`/`className` (CSS classes via `@wolf-tui/plugin`).

**Box style properties** (passed via `:style`):

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

**Text style properties** (passed via `:style`):

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
| `<Spinner>`       | Animated spinner with `label` and `type`                            |
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

```vue
<template>
	<!-- Alert (uses slot for message) -->
	<Alert variant="success" title="Deployed"> All services are running. </Alert>

	<!-- Badge (uses slot for label) -->
	<Badge color="green">NEW</Badge>

	<!-- StatusMessage (uses slot for message) -->
	<StatusMessage variant="success">Saved!</StatusMessage>

	<!-- TextInput -->
	<TextInput
		placeholder="Your name..."
		:onChange="(v) => console.log(v)"
		:onSubmit="(v) => console.log('done:', v)"
	/>

	<!-- Select -->
	<Select
		:options="[
			{ label: 'TypeScript', value: 'ts' },
			{ label: 'JavaScript', value: 'js' },
		]"
		:onChange="(v) => console.log('Picked:', v)"
	/>

	<!-- ProgressBar -->
	<ProgressBar :value="75" />

	<!-- Spinner -->
	<Spinner type="dots" label="Loading..." />

	<!-- Lists -->
	<OrderedList>
		<OrderedListItem>First</OrderedListItem>
		<OrderedListItem>Second</OrderedListItem>
	</OrderedList>
</template>
```

</details>

---

## Composables

### `useInput(handler, options?)`

Handle keyboard input. Available inside any component rendered by `render()`.

```vue
<script setup>
import { useInput } from '@wolf-tui/vue'

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

The `isActive` option accepts a ref, getter, or plain boolean (`MaybeRefOrGetter<boolean>`).

</details>

### `useApp()`

Access the app context — primarily for `exit()`.

```vue
<script setup>
import { useApp } from '@wolf-tui/vue'
const { exit } = useApp()
</script>
```

### `useFocus(options?)` / `useFocusManager()`

Make components focusable and control focus programmatically.

```vue
<script setup>
import { useFocus, useFocusManager } from '@wolf-tui/vue'

const { isFocused } = useFocus({ autoFocus: true })
const { focusNext, focusPrevious } = useFocusManager()
</script>
```

### Stream access

| Composable    | Returns                                     |
| ------------- | ------------------------------------------- |
| `useStdin()`  | `{ stdin, setRawMode, isRawModeSupported }` |
| `useStdout()` | `{ stdout, write }`                         |
| `useStderr()` | `{ stderr, write }`                         |

---

## Theming

Customize component appearance via the `theme` option in `render()`:

```ts
import { render, extendTheme, defaultTheme } from '@wolf-tui/vue'

const theme = extendTheme(defaultTheme, {
	components: {
		Spinner: { styles: { spinner: { color: 'cyan' } } },
		Alert: { styles: { container: { borderColor: 'blue' } } },
	},
})

render(App, { theme })
```

Or provide theme via Vue's injection system:

```vue
<script setup>
import { provideTheme, extendTheme, defaultTheme } from '@wolf-tui/vue'

provideTheme(
	extendTheme(defaultTheme, {
		/* overrides */
	})
)
</script>
```

| Export                         | Description                                    |
| ------------------------------ | ---------------------------------------------- |
| `extendTheme(base, overrides)` | Deep-merge overrides into base theme           |
| `defaultTheme`                 | Base theme object                              |
| `provideTheme(theme)`          | Provide theme via Vue injection                |
| `useComponentTheme(name)`      | Read theme for a component (inside components) |

---

## CSS Styling

Three approaches, all via `@wolf-tui/plugin`:

| Method       | Usage                                       |
| ------------ | ------------------------------------------- |
| Tailwind CSS | `class="text-green p-1"` + PostCSS setup    |
| CSS Modules  | `:class="$style.box"` with `<style module>` |
| SCSS/LESS    | `class="my-class"` + preprocessor           |

All resolve to inline terminal styles at build time — no runtime CSS engine.

<details>
<summary><b>Styling examples</b></summary>

**Tailwind CSS:**

```vue
<template>
	<Box class="flex-col p-4 gap-2">
		<Text class="text-green-500 font-bold">Tailwind styled</Text>
	</Box>
</template>

<style>
@import 'tailwindcss';
</style>
```

**CSS Modules:**

```vue
<template>
	<Box :class="$style.container">
		<Text :class="$style.title">CSS Modules</Text>
	</Box>
</template>

<style module>
.container {
	flex-direction: column;
	padding: 1rem;
}
.title {
	color: green;
	font-weight: bold;
}
</style>
```

</details>

---

## TypeScript Setup

<details>
<summary><b>Template IntelliSense and CSS module types</b></summary>

For full IntelliSense in Vue templates (Volar/vue-tsc), add global component types:

```ts
// env.d.ts
/// <reference types="@wolf-tui/vue/global" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<object, object, unknown>
	export default component
}
```

For CSS module autocomplete with actual class names, install the TypeScript plugin:

```bash
pnpm add -D @wolf-tui/typescript-plugin
```

```json
// tsconfig.json
{
	"compilerOptions": {
		"plugins": [{ "name": "@wolf-tui/typescript-plugin" }]
	}
}
```

For wolfie-specific CSS property suggestions in VS Code:

```json
// .vscode/settings.json
{
	"css.customData": ["./node_modules/@wolf-tui/plugin/wolfie.css-data.json"]
}
```

</details>

---

## Vue API Re-exports

Commonly used Vue APIs are re-exported for convenience:

```ts
import {
	ref,
	reactive,
	computed,
	watch,
	watchEffect,
	onMounted,
	onUnmounted,
	provide,
	inject,
	defineComponent,
	h,
} from '@wolf-tui/vue'
```

---

## Part of wolf-tui

This is the Vue adapter for [wolf-tui](../../README.md) — a framework-agnostic terminal UI library. The same layout engine (Taffy/flexbox) and component render functions power adapters for React, Angular, Solid, and Svelte.

<details>
<summary><b>Bundler examples</b></summary>

The `examples/` directory has working setups for each bundler:

| Bundler | Example                 |
| ------- | ----------------------- |
| Vite    | `examples/vue_vite/`    |
| esbuild | `examples/vue_esbuild/` |
| webpack | `examples/vue_webpack/` |

</details>

## License

MIT
