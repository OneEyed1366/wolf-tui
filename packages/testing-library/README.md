<div align="center">

# @wolf-tui/testing-library

### Testing CLI apps means fighting with `process.stdout` and ANSI escape codes. This library fixes that.

[![npm version](https://img.shields.io/npm/v/@wolf-tui/testing-library)](https://www.npmjs.com/package/@wolf-tui/testing-library)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

```bash
pnpm add -D @wolf-tui/testing-library
```

---

## The Problem

Testing CLI and TUI applications headlessly is tedious. You have to mock terminal I/O, intercept frame rendering, and strip complex ANSI escape sequences just to assert on plain text.

If you've used `ink-testing-library`, you already know the fix: virtual streams. What's new here is a framework-agnostic implementation designed specifically for the `wolf-tui` ecosystem (React, Vue, Angular, Solid, Svelte).

---

## See It Work

Write tests that feel like standard DOM assertions, without the DOM:

```typescript
import { test, expect } from 'vitest'
import { render } from '@wolf-tui/react' // or /vue, /solid, etc.
import { MockStdout, MockStdin, stripAnsi, KEYS } from '@wolf-tui/testing-library'
import { MyComponent } from './MyComponent'

test('handles user input', async () => {
  const stdout = new MockStdout()
  const stdin = new MockStdin()

  render(<MyComponent />, { stdout, stdin })

  // Send keystrokes
  stdin.emit('data', KEYS.Down)
  stdin.emit('data', KEYS.Enter)

  // Wait for the render loop to process
  await new Promise(r => setTimeout(r, 0))

  // Assert on human-readable text
  expect(stripAnsi(stdout.lastFrame())).toContain('Selection: Option B')
})
```

---

## Getting Started

1. **Install** the package.
2. **Setup your environment:** Ensure your test runner is forcing colors so ANSI rendering is deterministic across environments.

For Vitest, add a setup file:

```typescript
// test/setup.ts
import { chalk } from '@wolf-tui/core'
chalk.level = 3 // Force 16m colors
```

3. **Import what you need:**
   Most `wolf-tui` adapters export these utilities directly from a `/testing` subpath (e.g., `@wolf-tui/react/testing`), but you can also use this library directly if needed.

---

## How It Works

This library provides in-memory implementations of Node.js stream interfaces (`NodeJS.WriteStream` and `NodeJS.ReadStream`). When you pass these virtual streams into `wolf-tui`'s `render` function, it bypasses the real terminal entirely.

<details>
<summary><b>Details</b> — The Virtual Streams</summary>

- **`MockStdout` / `MockStderr`**: Captures rendered frames instead of writing them to the terminal. Provides methods like `.lastFrame()` to access the most recently rendered output.
- **`MockStdin`**: Simulates terminal input. Use `.emit('data', sequence)` to send keystrokes to your application.
- **`stripAnsi`**: A zero-dependency utility that removes ANSI color and layout escape codes from strings, making assertions straightforward.
- **`KEYS`**: A collection of common ANSI escape sequences (e.g., `KEYS.Up`, `KEYS.Enter`) for use with `MockStdin`.

</details>

---

## Reference

### `MockStdout` / `MockStderr`

- `lastFrame(): string`: Returns the most recent frame output.
- `frames: string[]`: Array of all captured frames.
- `clear()`: Clears the captured frames.

### `MockStdin`

- `emit(event: 'data', chunk: Buffer | string)`: Send a keystroke.

### `stripAnsi(str: string): string`

Strips ANSI escape codes from a string.

### `KEYS`

Dictionary containing ANSI sequences for keys:

- `KEYS.Up`, `KEYS.Down`, `KEYS.Left`, `KEYS.Right`
- `KEYS.Enter`, `KEYS.Escape`, `KEYS.Space`, `KEYS.Backspace`, `KEYS.Tab`

### `delay(ms: number): Promise<void>`

Helper for async tests to wait for rendering to settle.

---

## Contributing

Please see the monorepo root for contribution guidelines.

## License

MIT
