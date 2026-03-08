# AGENTS.md - Agent Configuration for wolf-tui

## Build & Test Commands

### Core Commands

```bash
pnpm install           # Install dependencies
pnpm dev              # Watch mode - all packages
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # ESLint check
pnpm lint:fix         # Auto-fix ESLint
pnpm format           # Prettier format
pnpm typecheck        # TypeScript compilation
```

### Single Test Execution

```bash
# Related tests (recommended for changes)
pnpm test:related

# Filter by package
pnpm --filter @wolfie/react test

# Vitest directly with pattern
vitest run --grep "pattern"

# Single file
pnpm -C packages/react test -- --run test/filename.test.ts
```

### Rust Bindings (Taffy Layout Engine)

```bash
cd internal/core
pnpm build:rust    # Native bindings
pnpm build:full    # Rust + TypeScript
```

## Code Style Guidelines

### TypeScript Configuration

```json
// tsconfig.base.json - strict mode enabled
{
	"strict": true,
	"skipLibCheck": true,
	"noEmit": true,
	"isolatedModules": true,
	"moduleResolution": "bundler"
}
```

### File Naming

| Type       | Convention  | Example            |
| ---------- | ----------- | ------------------ |
| Files      | kebab-case  | `render-node.ts`   |
| Components | PascalCase  | `TextInput`        |
| Functions  | camelCase   | `renderOutput`     |
| Constants  | SCREAMING\_ | `DEFAULT_THROTTLE` |
| Types      | PascalCase  | `RenderOptions`    |

### Import Order

1. External libraries (alphabetical)
2. Internal packages (alphabetical)
3. Local imports
4. Types (if separate)

```typescript
import Box from 'boxen'
import chalk from 'chalk'
import type { Options } from './types'

import { logger } from '../logger'
import { helper } from './helper'
```

### Type Usage

```typescript
// ✅ Preferred - type over interface for objects
type Options = { name: string; count?: number }

// ✅ Use satisfies for type-safe literals
const config = { debug: true, timeout: 5000 } satisfies Required<Config>

// ✅ Consistent type imports
import type { User } from './models'
const user: User = {}

// ❌ Avoid implicit any
const handler = (data: any) => {} // Use specific types
```

### Error Handling

```typescript
// ✅ Custom error classes
class ValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ValidationError'
	}
}

// ✅ Async error handling
try {
	await processFile(path)
} catch (error) {
	if (error instanceof ValidationError) {
		logger.warn(`Validation failed: ${error.message}`)
	} else {
		logger.error('Processing failed', error)
	}
}

// ✅ Return early with descriptive errors
function validateInput(input: unknown): asserts input is string {
	if (typeof input !== 'string') {
		throw new TypeError('Expected string, got ' + typeof input)
	}
}
```

### ESLint Rules (from eslint.config.js)

- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn
- `@typescript-eslint/no-unused-vars`: error (ignore `_` args)
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/consistent-type-imports`: error
- `camelcase`: error (allow `internal_`, `unstable__` prefixes)

### Prettier Configuration

```javascript
// prettier.config.js
{
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  useTabs: true,
  tabWidth: 2
}
```

### Package Structure

```
wolf-tui/
├── internal/
│   ├── core/           # @wolfie/core - Framework-agnostic engine
│   ├── css-parser/     # CSS preprocessing
│   └── shared/         # Shared utilities
├── packages/
│   ├── react/          # @wolfie/react
│   ├── vue/            # @wolfie/vue
│   ├── angular/        # @wolfie/angular
│   ├── plugin/         # Build plugin
│   └── typescript-plugin/
└── examples/           # Framework examples
```

### Testing Guidelines

- Use Vitest for unit tests
- Place tests in `test/` directories
- Pattern: `*.test.ts` or `*.test.tsx`
- Use `pnpm test:related` for change-focused testing
- Mock external dependencies with Sinon

### Linting Hooks

```bash
# Husky pre-commit hook
lint-staged:
  '**/*.{ts,tsx,js,jsx}': 'pnpm lint --fix'
  '**/*.{vue,html}': 'pnpm format'
```

### Build Tool Support

| Tool    | Status       | Notes                          |
| ------- | ------------ | ------------------------------ |
| Vite    | ✅ Primary   | Recommended for all frameworks |
| webpack | ✅ Supported | Via plugin                     |
| esbuild | ✅ Fast      | For production builds          |
| Rollup  | ✅ Via       | unplugin for tree-shaking      |

### Framework-Specific Notes

**React:**

- Uses React Compiler (babel-plugin-react-compiler)
- Supports React 19+ features
- Pre-compiled memoization for library components

**Vue:**

- SFC (.vue) and JSX/TSX support
- Composition API preferred

**Angular:**

- Requires Angular 17+
- Uses signals, computed, effect
- OnPush change detection

**SolidJS:**

- Fine-grained reactivity
- createSignal/createMemo primitives

### Performance Considerations

- Incremental ANSI rendering enabled by default
- Disable only when necessary: `incrementalRendering: false`
- React Compiler handles memoization automatically
- Use Taffy for layout calculations

### Common Patterns

```typescript
// ✅ Use const for object literals
const config = { a: 1, b: 2 }

// ✅ Use let for mutable state
let count = 0
count++

// ✅ Use var for module-level declarations (if needed)
// or export const for top-level

// ✅ Use arrow functions for callbacks
const handler = () => callback(data)

// ✅ Use early returns for clarity
function process(data) {
	if (!data) return null
	if (invalid) throw new Error('Invalid')
	// main logic
}
```

### Version Requirements

```json
{
	"engines": {
		"node": ">=20",
		"pnpm": ">=9"
	}
}
```

### Debugging Tips

```bash
# Enable logging
cross-env WOLFIE_LOG=1 pnpm dev

# Full error output
node --inspect=0.0.0.0:9229 script.js
```
