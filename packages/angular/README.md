# @wolf-tui/angular

### Build terminal UIs with Angular — flexbox layouts, styled components, signals

[![Angular 17+](https://img.shields.io/badge/angular-%3E%3D17.0.0-dd0031)](https://angular.dev)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

[Install](#install) · [Quick Start](#quick-start) · [Components](#components) · [Services](#services) · [Styling](#styling)

---

## The Problem

Angular has no terminal rendering target. If you want to build CLI apps with Angular's signals, dependency injection, and standalone components, you need a custom renderer that maps Angular's view to terminal output.

This package provides that renderer, plus 20+ components (inputs, selects, alerts, spinners, progress bars, lists) and injectable services (`injectInput`, `FocusService`, etc.) — all built for Angular 17+ with standalone components and OnPush change detection.

If you've used [Ink](https://github.com/vadimdemedes/ink) for React terminal UIs, this is the Angular equivalent. It uses the same layout engine (Taffy) and shared render functions as wolf-tui's React, Vue, Solid, and Svelte adapters.

---

## Install

### Scaffold a new project (recommended)

```bash
npm create wolf-tui -- --framework angular
```

Generates a complete project with bundler config, TypeScript, and optional CSS tooling. See [create-wolf-tui](../create-wolf-tui/README.md).

### Manual setup

```bash
# Runtime dependencies
pnpm add @wolf-tui/angular @angular/core @angular/common

# Build tooling
pnpm add -D @wolf-tui/plugin vite
```

| Peer dependency   | Version   |
| ----------------- | --------- |
| `@angular/core`   | >= 17.0.0 |
| `@angular/common` | >= 17.0.0 |

---

## Quick Start

```typescript
import { Component, signal } from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	injectInput,
	type Key,
} from '@wolf-tui/angular'

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box [style]="{ flexDirection: 'column', padding: 1 }">
			<w-text [style]="{ color: 'green', fontWeight: 'bold' }"
				>Counter: {{ count() }}</w-text
			>
			<w-text [style]="{ color: 'gray' }">↑/↓ to change, q to quit</w-text>
		</w-box>
	`,
})
export class AppComponent {
	count = signal(0)

	constructor() {
		injectInput((input: string, key: Key) => {
			if (key.upArrow) this.count.update((c) => c + 1)
			if (key.downArrow) this.count.update((c) => Math.max(0, c - 1))
		})
	}
}
```

```typescript
import { renderWolfie } from '@wolf-tui/angular'
import { AppComponent } from './app.component'

renderWolfie(AppComponent)
```

> For CSS class-based styling (`class="text-green p-1"`), see [Styling](#styling).

---

## `renderWolfie(component, options?)`

Mounts an Angular component to the terminal. Also exported as `render`.

```typescript
const instance = await renderWolfie(AppComponent, {
	stdout: process.stdout,
	stdin: process.stdin,
	maxFps: 30,
})

instance.unmount()
await instance.waitUntilExit()
```

| Option                  | Type                 | Default          | Description              |
| ----------------------- | -------------------- | ---------------- | ------------------------ |
| `stdout`                | `NodeJS.WriteStream` | `process.stdout` | Output stream            |
| `stdin`                 | `NodeJS.ReadStream`  | `process.stdin`  | Input stream             |
| `stderr`                | `NodeJS.WriteStream` | `process.stderr` | Error stream             |
| `maxFps`                | `number`             | `30`             | Maximum render frequency |
| `debug`                 | `boolean`            | `false`          | Disable frame throttling |
| `exitOnCtrlC`           | `boolean`            | `true`           | Exit on Ctrl+C           |
| `isScreenReaderEnabled` | `boolean`            | `false`          | Screen reader mode       |
| `providers`             | `Provider[]`         | `[]`             | Additional DI providers  |

---

## Components

All components use custom element selectors prefixed with `w-`. All are standalone.

### Layout

| Component             | Selector          | Description                                 | Key features                                               |
| --------------------- | ----------------- | ------------------------------------------- | ---------------------------------------------------------- |
| `BoxComponent`        | `<w-box>`         | Flexbox/Grid layout container               | All CSS-like flex props, `[style]` object, `class`         |
| `TextComponent`       | `<w-text>`        | Styled inline text                          | Color, bold/italic/underline, wrap modes                   |
| `NewlineComponent`    | `<w-newline>`     | Empty lines                                 | `[count]` input                                            |
| `SpacerComponent`     | `<w-spacer>`      | Fills remaining flex space                  | Pushes siblings apart in flex containers                   |
| `StaticComponent`     | `<w-static>`      | Renders items once, skips re-renders        | Append-only logs, scroll-back history                      |
| `TransformComponent`  | `<w-transform>`   | Transforms rendered text of children        | `transform: (line, idx) => string`                         |
| `ScrollViewComponent` | `<w-scroll-view>` | Fixed-height viewport with clipped overflow | Built-in arrow / PageUp / PageDown / Home / End navigation |
| `TableComponent`      | `<w-table>`       | Box-drawing table for tabular data          | `ink-table` parity, themable borders/cells, column subset  |

<details>
<summary><b>Box & Text inputs</b></summary>

Both accept `[style]` (inline object) and `class`/`[className]` (CSS classes via `@wolf-tui/plugin`).

**Box style properties** (passed via `[style]`):

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

**Text style properties** (passed via `[style]`):

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

| Component                | Selector             | Description                            | Key features                                                   |
| ------------------------ | -------------------- | -------------------------------------- | -------------------------------------------------------------- |
| `AlertComponent`         | `<w-alert>`          | Boxed alert message                    | `variant`: `success` / `error` / `warning` / `info` + title    |
| `BadgeComponent`         | `<w-badge>`          | Inline coloured label                  | `color` input, content projection = label                      |
| `SpinnerComponent`       | `<w-spinner>`        | Animated loading spinner               | 80+ `type`s (dots, line, arc, …), optional `label`             |
| `ProgressBarComponent`   | `<w-progress-bar>`   | Horizontal progress bar                | `value` 0–100, custom characters, themable colors              |
| `StatusMessageComponent` | `<w-status-message>` | One-line status with icon              | `variant`: `success` / `error` / `warning` / `info`            |
| `ErrorOverviewComponent` | `<w-error-overview>` | Formatted error display                | Pretty stack trace, source frame highlight                     |
| `GradientComponent`      | `<w-gradient>`       | Coloured text gradient                 | 13 presets or custom hex stops, per-character interpolation    |
| `BigTextComponent`       | `<w-big-text>`       | ASCII-art figlet-style banner          | `cfonts` engine, multiple fonts, gradients, alignment          |
| `TimerComponent`         | `<w-timer>`          | Count-up, countdown, or stopwatch      | Lap recording, configurable format, drift-resistant            |
| `TreeViewComponent`      | `<w-tree-view>`      | Hierarchical tree with expand/collapse | Single/multi-select, async lazy loading, virtual scroll        |
| `JsonViewerComponent`    | `<w-json-viewer>`    | Interactive JSON tree viewer           | 16 value types, syntax colouring, circular-reference detection |
| `FilePickerComponent`    | `<w-file-picker>`    | Filesystem browser with filter mode    | Multi-select, symlinks, directory navigation                   |

### Input

| Component                | Selector             | Description                         | Key features                                                   |
| ------------------------ | -------------------- | ----------------------------------- | -------------------------------------------------------------- |
| `TextInputComponent`     | `<w-text-input>`     | Single-line text field              | `(valueChange)` / `(submitValue)`, placeholder, mask           |
| `PasswordInputComponent` | `<w-password-input>` | Masked text input                   | Configurable mask character                                    |
| `EmailInputComponent`    | `<w-email-input>`    | Email field with domain suggestions | Auto-completes top-100 email domains                           |
| `ConfirmInputComponent`  | `<w-confirm-input>`  | Yes / No prompt                     | y / n keys, `(confirm)` / `(cancel)` outputs                   |
| `SelectComponent`        | `<w-select>`         | Single-selection picker             | Keyboard nav, themed indicator, `[options]` + `(selectChange)` |
| `MultiSelectComponent`   | `<w-multi-select>`   | Multi-selection picker              | Toggle with space, submit with enter                           |
| `ComboboxComponent`      | `<w-combobox>`       | Fuzzy-search autocomplete dropdown  | Two-pass fzf-style matching, cursor nav, autofill              |

### Lists

| Component                | Selector             | Description   | Key features                             |
| ------------------------ | -------------------- | ------------- | ---------------------------------------- |
| `OrderedListComponent`   | `<w-ordered-list>`   | Numbered list | Wraps `<w-ordered-list-item>` children   |
| `UnorderedListComponent` | `<w-unordered-list>` | Bulleted list | Wraps `<w-unordered-list-item>` children |

<details>
<summary><b>Component examples</b></summary>

```html
<!-- Alert (uses message input, not ng-content) -->
<w-alert
	variant="success"
	title="Deployed"
	message="All services running."
></w-alert>

<!-- Badge (uses label input, not ng-content) -->
<w-badge color="green" label="NEW"></w-badge>

<!-- StatusMessage (uses message input) -->
<w-status-message variant="success" message="Saved!"></w-status-message>

<!-- TextInput (uncontrolled — no [value] input) -->
<w-text-input
	placeholder="Your name..."
	(valueChange)="onNameChange($event)"
	(submitValue)="onNameSubmit($event)"
></w-text-input>

<!-- Select (uses [options] input, not child elements) -->
<w-select
	[options]="[
    { label: 'TypeScript', value: 'ts' },
    { label: 'JavaScript', value: 'js' }
  ]"
	(selectChange)="onPick($event)"
></w-select>

<!-- MultiSelect -->
<w-multi-select
	[options]="options"
	(selectionChange)="onChange($event)"
	(submitSelection)="onSubmit($event)"
></w-multi-select>

<!-- ConfirmInput -->
<w-confirm-input (confirm)="onYes()" (cancel)="onNo()"></w-confirm-input>

<!-- ProgressBar -->
<w-progress-bar [value]="75"></w-progress-bar>

<!-- Spinner -->
<w-spinner type="dots" label="Loading..."></w-spinner>

<!-- Lists -->
<w-ordered-list>
	<w-ordered-list-item>First</w-ordered-list-item>
	<w-ordered-list-item>Second</w-ordered-list-item>
</w-ordered-list>

<!-- Timer (countdown) -->
<w-timer
	variant="countdown"
	[durationMs]="60000"
	format="human"
	(complete)="onDone()"
></w-timer>

<!-- TreeView -->
<w-tree-view
	[data]="treeData"
	selectionMode="single"
	(selectChange)="onSelect($event)"
></w-tree-view>

<!-- Combobox -->
<w-combobox
	[options]="items"
	placeholder="Search..."
	(select)="onPick($event)"
></w-combobox>

<!-- JsonViewer -->
<w-json-viewer [data]="jsonData" [defaultExpandDepth]="2"></w-json-viewer>

<!-- FilePicker -->
<w-file-picker
	initialPath="."
	[multiSelect]="true"
	(select)="onFiles($event)"
></w-file-picker>

<!-- Table (ink-table parity) -->
<w-table [data]="rows" [columns]="['id', 'name']" [padding]="1"></w-table>
<!-- ScrollView — uncontrolled, built-in arrows/PageUp/PageDown/Home/End -->
<w-scroll-view #scrollRef [height]="8" (onScroll)="onOffset($event)">
	<w-text *ngFor="let it of items">{{ it }}</w-text>
</w-scroll-view>
<!-- @ViewChild('scrollRef') gives imperative methods:
     scrollRef.scrollToBottom(); scrollRef.scrollBy(4); -->
<!-- Gradient — by preset name (uses [text] input, not ng-content) -->
<w-gradient [text]="'wolf-tui in color'" name="rainbow"></w-gradient>

<!-- Gradient — custom stops -->
<w-gradient
	[text]="'Hand-picked stops'"
	[colors]="['#ff3366', '#ffd700']"
></w-gradient>
```

</details>

---

## Services

Angular uses dependency injection instead of hooks/composables.

### `injectInput(handler, options?)`

Inject keyboard input handler. Must be called in injection context (constructor or field initializer).

```typescript
import { injectInput, type Key } from '@wolf-tui/angular'

@Component({
	/* ... */
})
export class MyComponent {
	constructor() {
		injectInput((input: string, key: Key) => {
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
	}
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

The `isActive` option accepts `() => boolean` to conditionally enable/disable input.

</details>

### `AppService`

App lifecycle — inject for `exit()`.

```typescript
import { inject } from '@angular/core'
import { AppService } from '@wolf-tui/angular'

private app = inject(AppService)
this.app.exit()
```

### `FocusService`

Focus management — `focusNext()`, `focusPrevious()`, `focus(id)`, `activeFocusId` signal.

### Stream services

| Service         | Properties / Methods                          |
| --------------- | --------------------------------------------- |
| `StdinService`  | `stdin`, `isRawModeSupported`, `setRawMode()` |
| `StdoutService` | `stdout`, `write()`                           |
| `StderrService` | `stderr`, `write()`                           |

<details>
<summary><b>DI tokens for advanced use</b></summary>

Raw context tokens for direct injection:

```typescript
import {
	STDIN_CONTEXT,
	STDOUT_CONTEXT,
	STDERR_CONTEXT,
	APP_CONTEXT,
	FOCUS_CONTEXT,
	ACCESSIBILITY_CONTEXT,
} from '@wolf-tui/angular'
```

</details>

---

## Styling

```html
<!-- Inline styles -->
<w-box [style]="{ flexDirection: 'column', padding: 1, gap: 1 }">
	<w-text [style]="{ color: 'green', fontWeight: 'bold' }">Styled text</w-text>
</w-box>

<!-- Tailwind CSS -->
<w-box class="flex-col p-4 gap-2">
	<w-text class="text-green-500 font-bold">Tailwind styled</w-text>
</w-box>
```

| Method        | Usage                              |
| ------------- | ---------------------------------- |
| Inline styles | `[style]="{ color: 'green' }"`     |
| Tailwind CSS  | `class="text-green p-1"` + PostCSS |
| CSS Modules   | `[className]="styles.box"`         |

All CSS approaches resolve to terminal styles at build time — no runtime CSS engine.

---

## Angular Patterns

<details>
<summary><b>Signals, OnPush, and effects</b></summary>

**Signals** work seamlessly:

```typescript
@Component({
	template: `<w-text>Count: {{ count() }}</w-text>`,
})
export class CounterComponent {
	count = signal(0)

	constructor() {
		injectInput((_, key) => {
			if (key.upArrow) this.count.update((c) => c + 1)
		})
	}
}
```

**OnPush** change detection is fully supported — the renderer triggers `detectChanges()` after input handlers.

**Effects** work with wolf-tui:

```typescript
effect(() => {
	console.log('Count changed:', this.count())
})
```

</details>

---

## Part of wolf-tui

This is the Angular adapter for [wolf-tui](../../README.md) — a framework-agnostic terminal UI library. The same layout engine (Taffy/flexbox) and component render functions power adapters for React, Vue, Solid, and Svelte.

<details>
<summary><b>Bundler examples</b></summary>

| Bundler | Example                     |
| ------- | --------------------------- |
| Vite    | `examples/angular_vite/`    |
| esbuild | `examples/angular_esbuild/` |
| webpack | `examples/angular_webpack/` |

</details>

## License

MIT
