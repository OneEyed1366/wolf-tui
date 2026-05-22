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

Recommended: import the testing-aware `render` from your adapter's `/testing` subpath. It wires up the virtual streams for you and re-exports the helpers from this library:

```tsx
import { test, expect } from 'vitest'
import React from 'react'
import { render, KEYS, delay, stripAnsi } from '@wolf-tui/react/testing'
import { App } from './App'

test('navigates menu', async () => {
	const { stdin, lastFrame, unmount } = render(React.createElement(App), {
		columns: 80,
		rows: 24,
	})

	await stdin.write(KEYS.DOWN)
	await stdin.write(KEYS.ENTER)
	await delay(100)

	expect(stripAnsi(lastFrame() ?? '')).toContain('Selection: Option B')
	unmount()
})
```

<details>
<summary><b>Using <code>@wolf-tui/testing-library</code> directly</b> — for custom render setups</summary>

If your adapter doesn't have a `/testing` entry point yet, or you need finer control, wire the streams up yourself:

```typescript
import { MockStdout, MockStdin, stripAnsi, KEYS, delay } from '@wolf-tui/testing-library'
import { render } from '@wolf-tui/react'
import { App } from './App'

const stdout = new MockStdout(80, 24)
const stdin = new MockStdin(stdout) // MockStdin needs MockStdout for frame sync

render(<App />, { stdout, stdin })

await stdin.write(KEYS.DOWN)
await delay(100)

expect(stripAnsi(stdout.lastFrame() ?? '')).toContain('Option B')
```

</details>

---

## Getting Started

1. **Install** the package.
2. **Setup your environment:** Ensure your test runner is forcing colors so ANSI rendering is deterministic across environments.

For Vitest, add a setup file:

```typescript
// test/setup.ts
import chalk from 'chalk'

process.env.FORCE_COLOR = '3'
chalk.level = 3 // Force 16m colors in headless test runs
```

Reference it from `vitest.config.ts` via `test.setupFiles`. The `create-wolf-tui` scaffolder generates this automatically when `--test` is enabled.

3. **Import what you need:**
   Most `wolf-tui` adapters export these utilities directly from a `/testing` subpath (e.g., `@wolf-tui/react/testing`) wrapping them seamlessly, but you can also use this library directly if needed.

---

## How It Works

This library provides in-memory implementations of Node.js stream interfaces (`NodeJS.WriteStream` and `NodeJS.ReadStream`). When you pass these virtual streams into `wolf-tui`'s `render` function, it bypasses the real terminal entirely.

<details>
<summary><b>Details</b> — The Virtual Streams</summary>

- **`MockStdout` / `MockStderr`**: Captures rendered frames instead of writing them to the terminal. Provides methods like `.lastFrame()` to access the most recently rendered output.
- **`MockStdin`**: Simulates terminal input. Use `await stdin.write(sequence)` to send keystrokes to your application in tests.
- **`stripAnsi`**: Removes ANSI color and layout escape codes from strings with a single regex — no third-party `strip-ansi` dependency.
- **`KEYS`**: A collection of common ANSI escape sequences (e.g., `KEYS.UP`, `KEYS.ENTER`) for use with `MockStdin`.

</details>

---

## Reference

### `MockStdout` / `MockStderr`

- `constructor(columns?: number, rows?: number)`: `MockStdout` accepts initial terminal dimensions (default `80 × 24`). `MockStderr` takes no arguments.
- `lastFrame(): string | undefined`: Returns the most recent frame output (`undefined` if nothing rendered yet).
- `frames: string[]`: Array of all captured frames.
- `frameCount(): number`: Number of frames captured.
- `getFrame(index: number): string`: Returns the frame at a specific index.
- `clear(): void`: Clears the captured frames.

### `MockStdin`

- `constructor(stdout: MockStdout)`: Requires `MockStdout` reference to sync rendering events.
- `write(data: string | Buffer): Promise<void>`: Sends a keystroke and resolves once `stdout` emits the resulting frame (or after a 50ms safety timeout if no render happens).
- Implements the bare `NodeJS.ReadStream` surface used by wolf-tui: `setRawMode`, `setEncoding`, `ref`, `unref`, `read`, plus `data` / `readable` events.

### `stripAnsi(str: string): string`

Strips ANSI escape codes from a string.

### `KEYS`

Dictionary containing ANSI sequences for keys:

- `KEYS.UP`, `KEYS.DOWN`, `KEYS.LEFT`, `KEYS.RIGHT`
- `KEYS.ENTER`, `KEYS.ESC`, `KEYS.SPACE`, `KEYS.HOME`

### `delay(ms: number): Promise<void>`

Helper for async tests to wait for rendering to settle.

---

## Contributing

Please see the monorepo root for contribution guidelines.

## License

MIT
