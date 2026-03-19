# @wolfie/svelte

Svelte 5 adapter for wolf-tui. Build terminal user interfaces with Svelte.

## About

This package provides Svelte 5 components ported from the React ecosystem — originally [Ink](https://github.com/vadimdemedes/ink) by Vadim Demedes and the ink-\* component libraries. All components have been reimplemented using Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) and a complete DOM shim that satisfies Svelte's 26 internal DOM API calls.

## Features

- **Svelte 5 runes** — Uses `$state`, `$derived`, `$effect`, `$props` for reactive state
- **Complete DOM shim** — Real class hierarchy (`WolfieNode`, `WolfieElement`, etc.) assigned to `globalThis.Node/Element/Text` — Svelte's `init_operations()` finds proper prototype getters
- **`.svelte` SFC** — Write components using Svelte's single-file component syntax
- **Tree-shakeable** — Only imports what you use; tested with Vite
- **Full component library** — 20 components: inputs, alerts, spinners, progress bars, lists, selects
- **Composables API** — `useInput`, `useFocus`, `useFocusManager`, and more
- **CSS styling** — Tailwind CSS, CSS Modules, SCSS/LESS/Stylus via `@wolfie/plugin`

## Installation

```bash
npm install @wolfie/svelte @wolfie/plugin chalk
# or
pnpm add @wolfie/svelte @wolfie/plugin chalk
```

**Peer dependencies:**

- `svelte` ^5.0.0
- `chalk` ^5.0.0

## Quick Start

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { Box, Text } from '@wolfie/svelte'
</script>

<Box style={{ flexDirection: 'column', padding: 1 }}>
  <Text style={{ color: 'green', fontWeight: 'bold' }}>
    Hello, Terminal!
  </Text>
  <Text>Built with wolf-tui</Text>
</Box>
```

```ts
// index.ts
import { render } from '@wolfie/svelte'
import App from './App.svelte'

render(App)
```

### Vite Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { wolfie } from '@wolfie/plugin/vite'

export default defineConfig({
	plugins: [svelte(), wolfie('svelte')],
})
```

**Important:** Consumers must use `--conditions=browser` when running the built output so Node resolves Svelte to its client build (`mount()`), not the server SSR build.

```bash
node --conditions=browser dist/index.js
```

## Render Function

### `render(component, options?)`

Renders a Svelte component to the terminal. The first argument is a **component class** (the default export from a `.svelte` file).

```ts
import { render } from '@wolfie/svelte'
import App from './App.svelte'

const instance = render(App, {
	stdout: process.stdout,
	stdin: process.stdin,
	maxFps: 30,
})
```

#### Options

| Option                  | Type                 | Default          | Description        |
| ----------------------- | -------------------- | ---------------- | ------------------ |
| `stdout`                | `NodeJS.WriteStream` | `process.stdout` | Output stream      |
| `stdin`                 | `NodeJS.ReadStream`  | `process.stdin`  | Input stream       |
| `stderr`                | `NodeJS.WriteStream` | `process.stderr` | Error stream       |
| `maxFps`                | `number`             | `30`             | Maximum render FPS |
| `debug`                 | `boolean`            | `false`          | Disable throttling |
| `isScreenReaderEnabled` | `boolean`            | env-based        | Screen reader mode |
| `theme`                 | `ITheme`             | `{}`             | Component theming  |

---

## Components

### Layout Components

#### `<Box>`

Flexbox container for layout. Uses `style` prop for layout properties and `className` for CSS classes. Styles are applied via the `use:wolfieProps` action internally.

```svelte
<Box style={{ flexDirection: 'column', padding: 1, gap: 1 }}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Box>
```

| Prop          | Type             | Description                                         |
| ------------- | ---------------- | --------------------------------------------------- |
| `style`       | `Styles`         | Layout and visual styles (flexbox, padding, border) |
| `className`   | `ClassNameValue` | CSS class name(s) for style resolution              |
| `aria-label`  | `string`         | Accessible label                                    |
| `aria-hidden` | `boolean`        | Hide from screen readers                            |

**Style properties** (passed via `style`):

| Property         | Type                                                                          | Description          |
| ---------------- | ----------------------------------------------------------------------------- | -------------------- |
| `flexDirection`  | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'`                      | Flex direction       |
| `flexWrap`       | `'wrap' \| 'nowrap' \| 'wrap-reverse'`                                        | Flex wrap            |
| `flexGrow`       | `number`                                                                      | Flex grow factor     |
| `flexShrink`     | `number`                                                                      | Flex shrink factor   |
| `alignItems`     | `'flex-start' \| 'center' \| 'flex-end' \| 'stretch'`                         | Cross-axis alignment |
| `justifyContent` | `'flex-start' \| 'center' \| 'flex-end' \| 'space-between' \| 'space-around'` | Main-axis alignment  |
| `gap`            | `number`                                                                      | Gap between items    |
| `width`          | `number \| string`                                                            | Width                |
| `height`         | `number \| string`                                                            | Height               |
| `padding`        | `number`                                                                      | Padding (all sides)  |
| `margin`         | `number`                                                                      | Margin (all sides)   |
| `borderStyle`    | `'single' \| 'double' \| 'round' \| 'classic'`                                | Border style         |
| `borderColor`    | `string`                                                                      | Border color         |
| `overflow`       | `'visible' \| 'hidden'`                                                       | Overflow behavior    |

#### `<Text>`

Text rendering with styling.

```svelte
<Text style={{ color: 'green', fontWeight: 'bold', textDecoration: 'underline' }}>
  Styled text
</Text>
```

| Prop          | Type             | Description                             |
| ------------- | ---------------- | --------------------------------------- |
| `style`       | `Styles`         | Text styles (color, weight, decoration) |
| `className`   | `ClassNameValue` | CSS class name(s) for style resolution  |
| `aria-label`  | `string`         | Accessible label                        |
| `aria-hidden` | `boolean`        | Hide from screen readers                |

#### `<Newline>`

Adds empty lines.

```svelte
<Newline count={2} />
```

#### `<Spacer>`

Flexible space that fills available area.

```svelte
<Box>
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</Box>
```

#### `<Static>`

Renders static content that won't re-render.

```svelte
<Static items={logs}>{(item, index) => <Text>{item.message}</Text>}</Static>
```

#### `<Transform>`

Transforms child text via a string transform function.

```svelte
<Transform transform={(text) => text.toUpperCase()}>
  <Text>will be uppercase</Text>
</Transform>
```

---

### Display Components

#### `<Alert>`

```svelte
<Alert variant="success" title="Done!">
  Operation completed successfully.
</Alert>
```

| Prop       | Type                                          | Description   |
| ---------- | --------------------------------------------- | ------------- |
| `variant`  | `'success' \| 'error' \| 'warning' \| 'info'` | Alert variant |
| `title`    | `string`                                      | Alert title   |
| `children` | snippet                                       | Alert content |

#### `<Badge>`

```svelte
<Badge color="green">NEW</Badge>
```

#### `<Spinner>`

```svelte
<Spinner label="Loading..." />
```

#### `<ProgressBar>`

Value range is **0-100** (not 0-1).

```svelte
<ProgressBar value={75} />
```

#### `<StatusMessage>`

```svelte
<StatusMessage variant="success">Saved!</StatusMessage>
```

#### `<ErrorOverview>`

```svelte
<ErrorOverview error={error} />
```

---

### Input Components

#### `<TextInput>`

```svelte
<TextInput
  placeholder="Enter text..."
  defaultValue=""
  onChange={(value) => console.log(value)}
  onSubmit={(value) => console.log('Submitted:', value)}
/>
```

| Prop           | Type                      | Description              |
| -------------- | ------------------------- | ------------------------ |
| `isDisabled`   | `boolean`                 | Disable input            |
| `placeholder`  | `string`                  | Placeholder text         |
| `defaultValue` | `string`                  | Initial value            |
| `suggestions`  | `string[]`                | Autocomplete suggestions |
| `onChange`     | `(value: string) => void` | Value change callback    |
| `onSubmit`     | `(value: string) => void` | Enter key callback       |

#### `<PasswordInput>`

Masked password input. Same API as `<TextInput>`.

#### `<EmailInput>`

Email input with domain suggestions. Same API as `<TextInput>` plus `domains` prop.

#### `<ConfirmInput>`

Yes/No confirmation prompt.

```svelte
<ConfirmInput
  onConfirm={() => console.log('Yes')}
  onCancel={() => console.log('No')}
/>
```

#### `<Select>`

Single selection from an `options` array.

```svelte
<Select
  options={[
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
  ]}
  onChange={(value) => console.log('Selected:', value)}
/>
```

#### `<MultiSelect>`

Multiple selection from an `options` array.

```svelte
<MultiSelect
  options={[
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
  ]}
  onChange={(values) => console.log('Selected:', values)}
  onSubmit={(values) => console.log('Submitted:', values)}
/>
```

---

## Composables

### `useInput(handler, options?)`

Handle keyboard input.

```svelte
<script lang="ts">
  import { useInput } from '@wolfie/svelte'

  useInput((input, key) => {
    if (input === 'q') {
      // Exit
    }
    if (key.upArrow) {
      // Move up
    }
  })
</script>
```

#### Key Object

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

#### Options

| Option     | Type            | Default | Description                      |
| ---------- | --------------- | ------- | -------------------------------- |
| `isActive` | `() => boolean` | `true`  | Accessor to enable/disable input |

### `useApp()`

Access app context.

```svelte
<script lang="ts">
  import { useApp } from '@wolfie/svelte'
  const { exit } = useApp()
</script>
```

### `useFocus(options?)`

Make component focusable.

```svelte
<script lang="ts">
  import { useFocus } from '@wolfie/svelte'
  const { isFocused } = useFocus()
</script>
```

### `useFocusManager()`

Control focus programmatically.

```svelte
<script lang="ts">
  import { useFocusManager } from '@wolfie/svelte'
  const { focusNext, focusPrevious } = useFocusManager()
</script>
```

### `useStdin()` / `useStdout()` / `useStderr()`

Access terminal streams.

### `useIsScreenReaderEnabled()`

Check if screen reader mode is active.

---

## Architecture: DOM Shim

Unlike Solid (`createRenderer`) and Vue (`createRenderer()`), **Svelte 5 has no custom renderer API**. Compiled Svelte output calls `document.createElement()`, `.appendChild()`, `.insertBefore()`, `.removeChild()` directly.

The wolfie adapter intercepts these by **patching `globalThis`** with a complete DOM class hierarchy:

```
globalThis.Node      = WolfieNode       (firstChild, nextSibling, remove, before, after)
globalThis.Element   = WolfieElement    (appendChild, insertBefore, removeChild, append)
globalThis.Text      = WolfieText       (nodeValue getter/setter)
globalThis.Comment   = WolfieComment    (anchor nodes for {#if}/{#each})
globalThis.document  = WolfieDocument   (createElement, createTextNode, etc.)
```

Svelte's `init_operations()` caches getters via `Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild')`. Because `WolfieNode` is assigned directly to `globalThis.Node`, the prototype getters are found correctly.

The `wolfieProps` Svelte action handles style objects and function props that Svelte's `set_custom_element_data()` would otherwise stringify.

## Known Limitation: vite-node Dev Mode

`vite-node` creates separate instances of `svelte/internal/client` for `.svelte` vs `.svelte.ts` files, breaking `$state` reactivity across module boundaries. The `dev` script uses `vite build && node --conditions=browser dist/index.js` as a workaround. See CLAUDE.md "Known Quirks (Svelte)" for details.

## License

MIT
