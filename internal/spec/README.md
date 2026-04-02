# @wolf-tui/spec

Cross-framework behavioral contract tests and test helpers for wolf-tui adapters.

## Overview

When 5 adapters (React, Vue, Angular, Solid, Svelte) implement the same components, behavioral consistency is enforced through shared contract test suites. Each adapter provides a thin renderer function; the contracts verify that the component behaves identically across all frameworks.

> **Note:** This is a private internal package (`private: true`). It is not published to npm — only consumed by adapter test suites within the monorepo.

## Contract Tests

### Box Contract (`describeBoxContract`)

Tests background context propagation, computed styles, and layout defaults:

```typescript
import { describeBoxContract, type BoxTestRenderer } from '@wolf-tui/spec'

const renderBox: BoxTestRenderer = (props, options) => {
	// Framework-specific rendering...
	return { appliedStyle, providedBg, output }
}

describeBoxContract(renderBox)
```

**What it verifies:**

- Own `backgroundColor` is provided to children via context
- Parent background propagates when no own background is set
- Own background overrides parent background
- Computed style includes correct overflow and flex direction defaults

### Text Contract (`describeTextContract`)

Tests text rendering, styling, and ANSI output:

```typescript
import { describeTextContract, type TextTestRenderer } from '@wolf-tui/spec'

const renderText: TextTestRenderer = (props, options) => {
	// Framework-specific rendering...
	return { output }
}

describeTextContract(renderText)
```

**What it verifies:**

- Text content is preserved in output
- `fontWeight: 'bold'` produces ANSI bold codes
- Text decorations (italic, underline, etc.) produce correct escape sequences
- Colors are applied via ANSI codes

## Test Helpers

### `createStdout`

Creates a fake `process.stdout` for headless rendering in tests:

```typescript
import { createStdout } from '@wolf-tui/spec'

const stdout = createStdout({ columns: 80, rows: 24 })

// Use with any adapter's render function
render(App, { stdout, stdin, stderr })

// Read the last rendered frame
const frame = stdout.get()
```

**Returns:** A `FakeStdout` (EventEmitter-based) with:

- Configurable `columns` / `rows` (defaults: 100 × 24)
- Spy-wrapped `write()` via sinon
- `.get()` — returns the last written frame string

## Usage in Adapters

Each adapter implements the contract in its test directory (4 of 5 adapters currently):

```
packages/react/test/contracts/box.contract.test.tsx   → describeBoxContract(reactBoxRenderer)
packages/vue/test/contracts/box.contract.test.ts      → describeBoxContract(vueBoxRenderer)
packages/angular/test/contracts/box.contract.test.ts  → describeBoxContract(angularBoxRenderer)
packages/solid/test/contracts/box.contract.test.tsx   → describeBoxContract(solidBoxRenderer)
```

> **Note:** Svelte does not have contract tests yet.

The renderer is a thin adapter — typically 20-30 lines — that wires framework-specific rendering to the generic `BoxRenderResult` / `TextRenderResult` shape.

## Project Structure

```
src/
├── contracts/
│   ├── box.ts         # Box behavioral contract suite
│   └── text.ts        # Text behavioral contract suite
├── helpers/
│   └── create-stdout.ts  # Fake stdout for headless tests
└── index.ts           # Public API barrel
```

## Dependencies

| Package            | Role                            |
| ------------------ | ------------------------------- |
| `@wolf-tui/core`   | `Styles` type definitions       |
| `@wolf-tui/shared` | `ClassNameValue` type           |
| `chalk`            | ANSI color assertion support    |
| `sinon`            | Spy-based stdout.write tracking |
| `vitest`           | Test runner (dev dependency)    |

## License

MIT
