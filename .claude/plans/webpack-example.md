# Plan: Webpack Example Improvements

## Current State

The webpack example exists at `packages/react/examples/webpack/` but has issues:

1. **Circular dependency crash**: `ReferenceError: Cannot access 'spinnerTheme' before initialization`
   - `theme.tsx` imports `spinnerTheme` from `Spinner`
   - `Spinner.tsx` imports `useComponentTheme` from `theme.tsx`
   - Webpack is more sensitive to circular deps than esbuild

2. **Minimal demo**: Only shows basic counter + single Tailwind class
   - Esbuild/Vite examples showcase ALL styling flavors (Tailwind, SCSS, LESS, Stylus, CSS Modules)

3. **Missing style files**: No `styles/` directory with preprocessor examples

4. **Complex webpack config**: Has custom `CopyNativeBinariesPlugin` and manual alias resolution that esbuild handles automatically

## Plan

### Phase 1: Fix Circular Dependency (React package)

The React package needs the same fix Vue got - lazy loading Proxy for theme imports.

**File**: `packages/react/src/theme/theme.tsx`

Replace direct imports with lazy getters:

```typescript
// Before (causes circular dep)
import { spinnerTheme } from '../components/Spinner'

// After (lazy resolution)
const lazyTheme = <T>(getter: () => T): T =>
	new Proxy({} as T, {
		get: (_, prop) => getter()[prop as keyof T],
	})

export const defaultTheme: ITheme = {
	components: {
		Spinner: lazyTheme(() => require('../components/Spinner').spinnerTheme),
		// ... other themes
	},
}
```

Or use dynamic import pattern that the Vue package uses.

### Phase 2: Align Webpack Example with Esbuild/Vite

**Files to create** (copy from esbuild example):

```
packages/react/examples/webpack/
├── src/
│   ├── index.tsx          # UPDATE: match esbuild's comprehensive demo
│   └── styles.css         # DELETE (replaced by styles/)
├── styles/
│   ├── tailwind.css       # NEW
│   ├── global.css         # NEW
│   ├── components.scss    # NEW
│   ├── styles.less        # NEW
│   ├── styles.styl        # NEW
│   ├── Button.module.css  # NEW
│   └── Card.module.css    # NEW
├── package.json           # UPDATE: add sass, less, stylus deps
├── webpack.config.js      # UPDATE: simplify, add preprocessor loaders
├── postcss.config.cjs     # EXISTS
└── tsconfig.json          # EXISTS
```

### Phase 3: Update package.json

Add missing devDependencies:

```json
{
	"devDependencies": {
		"sass": "^1.69.0",
		"sass-loader": "^14.0.0",
		"less": "^4.2.0",
		"less-loader": "^12.0.0",
		"stylus": "^0.63.0",
		"stylus-loader": "^8.0.0"
	}
}
```

### Phase 4: Simplify webpack.config.js

1. Remove `CopyNativeBinariesPlugin` - wolfie plugin should handle this
2. Remove manual aliases - wolfie plugin resolves these
3. Add preprocessor loaders for SCSS/LESS/Stylus
4. Let wolfie plugin transform CSS to JS objects

Key webpack rules needed:

```javascript
{
  test: /\.scss$/,
  use: ['wolfie-loader', 'sass-loader']
},
{
  test: /\.less$/,
  use: ['wolfie-loader', 'less-loader']
},
{
  test: /\.styl$/,
  use: ['wolfie-loader', 'stylus-loader']
}
```

But since wolfie is an unplugin, it may already handle this via `transform`. Need to verify.

### Phase 5: Update src/index.tsx

Match the esbuild example's comprehensive demo:

- Import all style flavors
- Show Tailwind, SCSS, LESS, Stylus, CSS Modules sections
- Use CSS Module imports (`buttonStyles`, `cardStyles`)

## Verification

After implementation:

```bash
cd packages/react/examples/webpack
pnpm example
```

Should render the same multi-flavor demo as esbuild example without errors.

## Files to Modify

1. `packages/react/src/theme/theme.tsx` - Fix circular dep with lazy loading
2. `packages/react/examples/webpack/package.json` - Add preprocessor deps
3. `packages/react/examples/webpack/webpack.config.js` - Simplify config
4. `packages/react/examples/webpack/src/index.tsx` - Comprehensive demo
5. Create `packages/react/examples/webpack/styles/` directory with all style files

## Open Questions

1. Should wolfie webpack plugin handle native bindings automatically like esbuild does?
2. Does unplugin's webpack adapter support the same CSS transform as esbuild's custom implementation?

The esbuild plugin has 300+ lines of custom code for CSS handling, Tailwind integration, and native bindings. The webpack plugin is just 7 lines wrapping unplugin. This asymmetry may be the root cause.
