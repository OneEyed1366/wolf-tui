# create-wolf-tui

### Scaffold wolf-tui terminal UI projects — pick a framework, bundler, and styling

[![Node](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

[Quick Start](#quick-start) · [Options](#options) · [Support Matrix](#support-matrix) · [CLI Flags](#cli-flags) · [Architecture](#architecture)

---

## The Problem

Setting up a wolf-tui project requires wiring together a framework adapter, a bundler, TypeScript config, optional CSS tooling (Tailwind, SCSS, LESS, Stylus), and framework-specific quirks (Svelte's `--conditions=browser`, Angular's SSR build, Solid's bundled runtime). Getting this right manually means copying boilerplate from examples and adjusting dozens of config lines.

This CLI generates a working project in one command — framework, bundler, styling, linting, and git all pre-configured.

---

## Quick Start

```bash
# npm
npm create wolf-tui

# pnpm
pnpm create wolf-tui

# yarn
yarn create wolf-tui
```

> **Note:** This package must be published to npm first (`npm publish`). For local development, use `pnpm --filter create-wolf-tui scaffold` from the monorepo root.

The CLI walks you through:

1. **Project name** — directory to create
2. **Framework** — React, Vue, Angular, Solid, or Svelte
3. **Bundler** — Vite, Webpack, or esbuild (filtered by framework)
4. **Tailwind CSS** — yes/no
5. **CSS preprocessor** — None, Sass/SCSS, Less, or Stylus
6. **ESLint + Prettier** — yes/no
7. **Git init** — yes/no
8. **Install dependencies** — yes/no

Output: a ready-to-run project with `src/`, `package.json`, `tsconfig.json`, bundler config, and a starter app.

```bash
cd my-wolf-app && npm run dev
```

---

## Options

### Frameworks

| Framework | Adapter             | Peer dependency         |
| --------- | ------------------- | ----------------------- |
| React     | `@wolf-tui/react`   | `react ^19.0.0`         |
| Vue       | `@wolf-tui/vue`     | `vue ^3.5.0`            |
| Angular   | `@wolf-tui/angular` | `@angular/core ^19.0.0` |
| Solid     | `@wolf-tui/solid`   | `solid-js ^1.9.0`       |
| Svelte    | `@wolf-tui/svelte`  | `svelte ^5.0.0`         |

### Bundlers

| Bundler | Config file         | Notes                |
| ------- | ------------------- | -------------------- |
| Vite    | `vite.config.ts`    | Recommended for most |
| Webpack | `webpack.config.js` | Full control         |
| esbuild | `build.js`          | Fastest builds       |
| Rollup  | —                   | Coming soon          |

### CSS Styling

| Option       | What it adds                                                             |
| ------------ | ------------------------------------------------------------------------ |
| Tailwind CSS | `tailwindcss`, `@tailwindcss/postcss`, `postcss.config.cjs`, starter CSS |
| Sass / SCSS  | `sass` dev dependency, `.scss` starter file                              |
| Less         | `less` dev dependency, `.less` starter file                              |
| Stylus       | `stylus` dev dependency, `.styl` starter file                            |

Tailwind and a preprocessor can be combined — they're independent choices.

---

## Support Matrix

| Framework | Vite | Webpack | esbuild |
| --------- | ---- | ------- | ------- |
| React     | Yes  | Yes     | Yes     |
| Vue       | Yes  | Yes     | Yes     |
| Angular   | Yes  | Yes     | Yes     |
| Solid     | —    | Yes     | Yes     |
| Svelte    | Yes  | Yes     | Yes     |

Solid + Vite is not yet supported (vite-plugin-solid resolves to the server build, breaking the universal renderer).

---

## CLI Flags

Skip the interactive prompts with flags:

```bash
# Fully non-interactive
npm create wolf-tui my-app -- --framework react --bundler vite --css tailwind --lint --git -y

# Framework + bundler, prompt the rest
npm create wolf-tui my-app -- -f vue -b webpack

# Tailwind + Sass together
npm create wolf-tui my-app -- -f react -b vite --css tailwind,sass -y

# No linting, no git
npm create wolf-tui my-app -- -f angular -b esbuild --no-lint --no-git -y
```

| Flag                   | Short | Description                                           |
| ---------------------- | ----- | ----------------------------------------------------- |
| `--framework <name>`   | `-f`  | `react`, `vue`, `angular`, `solid`, `svelte`          |
| `--bundler <name>`     | `-b`  | `vite`, `webpack`, `esbuild`                          |
| `--css <presets>`      |       | Comma-separated: `tailwind`, `sass`, `less`, `stylus` |
| `--lint` / `--no-lint` |       | ESLint + Prettier                                     |
| `--git` / `--no-git`   |       | Git init                                              |
| `--yes`                | `-y`  | Accept defaults, skip prompts                         |

Positional argument is the project name: `npm create wolf-tui my-app`.

---

## What Gets Generated

```
my-wolf-app/
  src/
    index.tsx          # Entry point (extension varies by framework)
    App.tsx            # Starter component
    styles/            # Only if Tailwind or preprocessor selected
      tailwind.css
  package.json         # Dependencies, scripts (dev, build)
  tsconfig.json        # Strict TS, framework-specific JSX settings
  vite.config.ts       # Bundler config (or webpack.config.js / build.js)
  env.d.ts             # Only with Vite
  postcss.config.cjs   # Only if Tailwind selected
  eslint.config.js     # Only if lint selected
  .prettierrc.json     # Only if lint selected
  .gitignore
```

The starter app is a counter with keyboard input — up/down arrows to change the value, `q` to quit. Same pattern across all frameworks.

---

## Architecture

<details>
<summary><b>Layer composition system</b></summary>

The scaffolder uses a layer-based composition architecture. Each choice (framework, bundler, CSS, lint) is an independent `ILayer` that contributes:

- **Files** — static files, EJS templates, or generated content
- **package.json patches** — dependencies, devDependencies, scripts
- **tsconfig patches** — compiler options, include paths
- **Externals** — modules to exclude from bundling
- **Template variables** — values injected into EJS templates
- **Config patches** — slot-based content injection into bundler configs
- **Validators** — post-composition warnings

Layers are composed in order: `base → framework → bundler → interaction → css → lint`.

**Interaction layers** handle framework+bundler-specific config that neither layer can express alone (e.g., Svelte+Vite needs `wolfiePreprocess()` in the Svelte plugin, Angular+Webpack needs a custom `ng-packagr` setup).

```
┌──────────┐
│   base   │  TypeScript, @wolf-tui/plugin, .gitignore
└────┬─────┘
     │
┌────┴──────┐
│ framework │  Adapter dep, entry/app templates, JSX config
└────┬──────┘
     │
┌────┴──────┐
│  bundler  │  Bundler dep, config template, build/dev scripts
└────┬──────┘
     │
┌────┴───────────┐
│  interaction   │  Framework×bundler overrides (plugins, externals, quirks)
└────┬───────────┘
     │
┌────┴──────┐
│    css    │  Tailwind and/or preprocessor deps, config, starter files
└────┬──────┘
     │
┌────┴──────┐
│   lint    │  ESLint + Prettier config (framework-aware)
└───────────┘
```

Slot-based config injection lets layers contribute to shared config files without knowing about each other. For example, the Tailwind layer adds a `css: { postcss: ... }` slot to `vite.config.ts`, and the Svelte interaction layer adds `preprocess: [wolfiePreprocess()]` — both inject into the same template via named slots.

</details>

<details>
<summary><b>Version pinning</b></summary>

Package versions are auto-generated from the monorepo's current state:

```bash
pnpm --filter create-wolf-tui bake-versions
```

This reads the workspace `package.json` files and writes `src/versions.gen.ts` — a frozen record of compatible versions. Scaffolded projects get version ranges that are tested together.

</details>

---

## Programmatic API

The CLI is also a library — compose and render projects without the interactive prompts:

```ts
import { compose, renderProject } from 'create-wolf-tui'
import type { IProjectConfig } from 'create-wolf-tui'

const config: IProjectConfig = {
	name: 'my-app',
	framework: 'react',
	bundler: 'vite',
	tailwind: true,
	cssPreprocessor: 'sass',
	lint: true,
	git: false,
	install: false,
	targetDir: '/tmp/my-app',
}

const composed = compose(config)
renderProject(composed, config.targetDir)
```

| Export                         | Description                                           |
| ------------------------------ | ----------------------------------------------------- |
| `compose(config)`              | Collects layers, merges patches, renders templates    |
| `renderProject(composed, dir)` | Writes files, `package.json`, `tsconfig.json` to disk |
| `isSupported(fw, bundler)`     | Check if a framework+bundler combo is supported       |
| `SUPPORTED_MATRIX`             | Full support matrix record                            |

---

## Part of wolf-tui

This is the scaffolding CLI for [wolf-tui](../../README.md) — a framework-agnostic terminal UI library. Generated projects come pre-configured with the correct adapter, build tooling, and styling pipeline.

## License

MIT
