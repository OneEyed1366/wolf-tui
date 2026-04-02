# @wolf-tui/plugin

Build plugin for wolf-tui. Enables CSS/SCSS/LESS/Stylus and Tailwind CSS support.

## What it does

- Transforms CSS/SCSS/LESS/Stylus imports into wolf-tui compatible styles
- Supports Tailwind CSS v3 and v4 with JIT compilation
- Handles CSS Modules (`.module.css`) and global styles
- Provides native binding setup for `@wolf-tui/core`

## Installation

```bash
npm install @wolf-tui/plugin
# or
pnpm add @wolf-tui/plugin
```

## Bundler Setup

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import wolfie from '@wolf-tui/plugin/vite'

export default defineConfig({
	plugins: [
		wolfie('react'), // or 'vue', 'angular', 'solid'
	],
})
```

### esbuild

```typescript
// esbuild.config.js
import * as esbuild from 'esbuild'
import wolfie, { generateNativeBanner } from '@wolf-tui/plugin/esbuild'

await esbuild.build({
	entryPoints: ['src/index.tsx'],
	bundle: true,
	platform: 'node',
	format: 'cjs',
	banner: {
		js: generateNativeBanner('cjs'), // Required for native bindings
	},
	plugins: [
		wolfie('react'), // or 'vue', 'angular', 'solid'
	],
})
```

> **Note:** The `generateNativeBanner` helper generates code for native `.node` binding resolution at runtime. Use `'cjs'` or `'es'` to match your output format.

### webpack

```javascript
// webpack.config.js
const wolfie = require('@wolf-tui/plugin/webpack').default

module.exports = {
	plugins: [
		wolfie('react'), // or 'vue', 'angular', 'solid'
	],
}
```

### Rollup

```javascript
// rollup.config.js
import wolfie from '@wolf-tui/plugin/rollup'

export default {
	plugins: [
		wolfie('react'), // or 'vue', 'angular', 'solid'
	],
}
```

---

## Styling Guide

### CSS Modules

Files with `.module.css` (or `.module.scss`, etc.) are treated as CSS Modules:

```css
/* Button.module.css */
.container {
	flex-direction: column;
	padding: 1rem;
}

.title {
	color: green;
	font-weight: bold;
}
```

```tsx
import styles from './Button.module.css'

function Button() {
	return (
		<Box className={styles.container}>
			<Text className={styles.title}>Hello</Text>
		</Box>
	)
}
```

### Global Styles

Regular `.css` files are registered globally:

```css
/* styles.css */
.container {
	flex-direction: column;
	padding: 1rem;
}
```

```tsx
import './styles.css'

function App() {
	return <Box className="container">...</Box>
}
```

---

### Tailwind CSS

Full Tailwind v3.4 and v4.1 support with JIT compilation.

#### Setup

1. Install Tailwind:

   ```bash
   npm install tailwindcss
   ```

2. Create `tailwind.config.js` (for v3) or use `@import 'tailwindcss'` (for v4):

   ```javascript
   // tailwind.config.js (v3)
   export default {
   	content: ['./src/**/*.{tsx,vue,ts}'],
   }
   ```

3. Import in your CSS:

   ```css
   /* styles.css - Tailwind v3 */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

   ```css
   /* styles.css - Tailwind v4 */
   @import 'tailwindcss';
   ```

4. Use in components:
   ```tsx
   <Box className="flex-col p-4 gap-2">
   	<Text className="text-green-500 font-bold">Tailwind!</Text>
   </Box>
   ```

#### Terminal Border Utilities

wolf-tui extends Tailwind with terminal-specific border styles via `@utility`. Scaffolded projects include these by default:

```css
@utility border-round {
	border-style: round;
} /* ╭╮╰╯─│ */
@utility border-single {
	border-style: single;
} /* ┌┐└┘─│ */
@utility border-bold {
	border-style: bold;
} /* ┏┓┗┛━┃ */
@utility border-classic {
	border-style: classic;
} /* ++-+-- */
@utility border-arrow {
	border-style: arrow;
} /* ↘↙↗↖→← */
```

Usage:

```tsx
<Box className="border-round border-[cyan] px-2 py-1">
	<Text className="font-bold text-[green]">Rounded box</Text>
</Box>
```

Add your own in the same CSS file:

```css
@utility my-panel {
	border-style: round;
	border-color: cyan;
	padding-left: 2;
	padding-right: 2;
}
```

> `border-double` is built-in Tailwind — it maps to cli-boxes `double` (╔╗╚╝═║) automatically.

A reference preset is available at `@wolf-tui/plugin/tailwind.css`.

#### Features

- **JIT compilation** — Only generates CSS for used utilities
- **Arbitrary values** — `w-[80]`, `text-[cyan]`, `p-[2rem]`
- **`@utility` parsing** — Custom terminal utilities defined via Tailwind v4 `@utility` directive
- **OKLCH colors** — Custom shim enables native OKLCH support
- **Modern color functions** — `oklch()`, `hsl()`, `lab()`, `lch()`

---

### Preprocessors

#### SCSS/Sass

```scss
// styles.scss
$primary: green;

.container {
	flex-direction: column;

	.title {
		color: $primary;
		font-weight: bold;
	}
}
```

#### LESS

```less
// styles.less
@primary: green;

.container {
	flex-direction: column;

	.title {
		color: @primary;
		font-weight: bold;
	}
}
```

#### Stylus

```stylus
// styles.styl
primary = green

.container
  flex-direction column

  .title
    color primary
    font-weight bold
```

---

## Unit Conversion

CSS units are converted to terminal cells:

| CSS Unit | Terminal Conversion                     |
| -------- | --------------------------------------- |
| `px`     | value / 4 cells                         |
| `rem`    | value × 4 cells (1rem = 16px = 4 cells) |
| `em`     | Same as rem                             |
| `%`      | Percentage of parent                    |
| `vw`     | Percentage of terminal width            |
| `vh`     | Percentage of terminal height           |
| `ch`     | 1 cell per character                    |

Examples:

- `padding: 1rem` → 4 cells padding
- `width: 50%` → Half of parent width
- `height: 100vh` → Full terminal height
- `gap: 8px` → 2 cells gap

---

## Options

```typescript
wolfie('react', {
	// File pattern to include (default: all CSS files)
	include: /\.css$/,

	// File pattern to exclude
	exclude: /vendor/,

	// Handle native bindings (default: true)
	nativeBindings: true,
})
```

| Option           | Type      | Default       | Description                   |
| ---------------- | --------- | ------------- | ----------------------------- |
| `include`        | `RegExp`  | All CSS files | Files to process              |
| `exclude`        | `RegExp`  | —             | Files to skip                 |
| `nativeBindings` | `boolean` | `true`        | Setup native `.node` bindings |

---

## Supported File Extensions

- `.css` — Plain CSS
- `.scss`, `.sass` — Sass/SCSS
- `.less` — LESS
- `.styl`, `.stylus` — Stylus

All extensions support the `.module.` prefix for CSS Modules.

---

## CSS Property Support

### Fully Supported

| CSS Property                   | Notes                                       |
| ------------------------------ | ------------------------------------------- |
| `display`                      | `flex`, `none`                              |
| `flex-direction`               | All values                                  |
| `flex-wrap`                    | All values                                  |
| `flex-grow/shrink/basis`       | All values                                  |
| `align-items/self`             | All values                                  |
| `justify-content`              | All values                                  |
| `gap`, `row-gap`, `column-gap` | Number or rem                               |
| `width`, `height`              | Number, %, vw, vh                           |
| `min-width`, `min-height`      | Number                                      |
| `padding`, `margin`            | All shorthand forms                         |
| `border-style`                 | single, double, round, bold, classic, arrow |
| `border-color`                 | ANSI or hex                                 |
| `color`                        | ANSI, hex, rgb, oklch                       |
| `background-color`             | ANSI, hex, rgb, oklch                       |
| `font-weight`                  | bold, normal, numeric                       |
| `font-style`                   | italic, normal                              |
| `text-decoration`              | underline, line-through                     |
| `overflow`                     | visible, hidden                             |
| `position`                     | absolute, relative                          |

### Not Supported

- `box-shadow` — No TUI equivalent
- `transform` — No TUI equivalent
- `animation` — No TUI equivalent
- `gradient` — Only solid colors
- `opacity` — Binary (visible/hidden)

---

## Framework Differences

| Feature       | React     | Vue        | Angular    | Solid     |
| ------------- | --------- | ---------- | ---------- | --------- |
| Class names   | camelCase | kebab-case | kebab-case | camelCase |
| Import syntax | ESM       | ESM        | ESM        | ESM       |
| SFC styles    | —         | Supported  | Inline     | —         |

---

## Troubleshooting

### "Cannot find native binding"

Ensure `nativeBindings: true` (default) and rebuild:

```bash
cd node_modules/@wolf-tui/core
npm run build:rust
```

### Tailwind classes not working

1. Check `content` paths in `tailwind.config.js`
2. Ensure CSS file is imported
3. Verify Tailwind is installed

### OKLCH colors not rendering

The OKLCH shim converts colors to sRGB hex. If colors look wrong:

- Check color values are valid OKLCH
- Terminal must support true color (most modern terminals do)

---

## VS Code CSS IntelliSense

This package includes a CSS Custom Data file that provides IntelliSense for Wolfie-specific CSS property values.

### Setup

Add to your `.vscode/settings.json`:

```json
{
	"css.customData": ["./node_modules/@wolf-tui/plugin/wolfie.css-data.json"]
}
```

### What it provides

- **Border styles** — `single`, `double`, `round` suggestions for `border-style`
- **Text wrap** — `wrap`, `truncate`, `truncate-end`, `truncate-middle`, `truncate-start`
- **Terminal values** — `flex`/`none` for display, `hidden`/`visible` for overflow
- **Hover documentation** — Descriptions for each terminal-specific value

### Example

```css
.container {
	border-style: single; /* ✓ VS Code shows this as valid */
	text-wrap: truncate; /* ✓ VS Code shows terminal-specific options */
}
```

## License

MIT
