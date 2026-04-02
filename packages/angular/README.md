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

| Component            | Selector        | Description                              |
| -------------------- | --------------- | ---------------------------------------- |
| `BoxComponent`       | `<w-box>`       | Flexbox container — `[style]` or `class` |
| `TextComponent`      | `<w-text>`      | Styled text — color, bold, etc           |
| `NewlineComponent`   | `<w-newline>`   | Empty lines (`[count]`)                  |
| `SpacerComponent`    | `<w-spacer>`    | Fills available flex space               |
| `StaticComponent`    | `<w-static>`    | Renders items once (no re-renders)       |
| `TransformComponent` | `<w-transform>` | Applies string transform to children     |

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

| Component                | Selector             | Description                            |
| ------------------------ | -------------------- | -------------------------------------- |
| `AlertComponent`         | `<w-alert>`          | `variant` + `title` + `message` inputs |
| `BadgeComponent`         | `<w-badge>`          | `color` + `label` inputs               |
| `SpinnerComponent`       | `<w-spinner>`        | `type` + `label` inputs                |
| `ProgressBarComponent`   | `<w-progress-bar>`   | `value` input (0–100)                  |
| `StatusMessageComponent` | `<w-status-message>` | `variant` + `message` inputs           |
| `ErrorOverviewComponent` | `<w-error-overview>` | `[error]` input                        |

### Input

| Component                | Selector             | Description                                      |
| ------------------------ | -------------------- | ------------------------------------------------ |
| `TextInputComponent`     | `<w-text-input>`     | Uncontrolled — `(valueChange)` / `(submitValue)` |
| `PasswordInputComponent` | `<w-password-input>` | Masked text input                                |
| `EmailInputComponent`    | `<w-email-input>`    | Email with domain suggestions                    |
| `ConfirmInputComponent`  | `<w-confirm-input>`  | `(confirm)` / `(cancel)` outputs                 |
| `SelectComponent`        | `<w-select>`         | `[options]` input, `(selectChange)` output       |
| `MultiSelectComponent`   | `<w-multi-select>`   | `[options]` input, `(selectionChange)` output    |

### Lists

| Component                    | Selector                  |
| ---------------------------- | ------------------------- |
| `OrderedListComponent`       | `<w-ordered-list>`        |
| `OrderedListItemComponent`   | `<w-ordered-list-item>`   |
| `UnorderedListComponent`     | `<w-unordered-list>`      |
| `UnorderedListItemComponent` | `<w-unordered-list-item>` |

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
