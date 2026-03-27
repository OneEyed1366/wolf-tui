# Changelog

## [1.3.0](https://github.com/OneEyed1366/wolf-tui/compare/react@v1.2.1...react@v1.3.0) (2026-03-26)

### Features

- move chalk to auto-installed dependency ([84cf659](https://github.com/OneEyed1366/wolf-tui/commit/84cf659471ed8c96699720666cd860acdddc616a))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @wolf-tui/core bumped to 1.3.0
    - @wolf-tui/shared bumped to 1.3.0
  - devDependencies
    - @wolf-tui/css-parser bumped to 1.3.0
    - @wolf-tui/plugin bumped to 1.3.0

## [1.2.1](https://github.com/OneEyed1366/wolf-tui/compare/react@v1.2.0...react@v1.2.1) (2026-03-25)

### Features

- add Svelte 5 adapter with complete DOM shim ([#4](https://github.com/OneEyed1366/wolf-tui/issues/4)) ([f34c6c3](https://github.com/OneEyed1366/wolf-tui/commit/f34c6c3c758cfb6c9ac1fb0ecd94ace4d4929b03))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @wolf-tui/core bumped to 1.2.1
    - @wolf-tui/shared bumped to 1.2.1
  - devDependencies
    - @wolf-tui/css-parser bumped to 1.2.1
    - @wolf-tui/plugin bumped to 1.2.1

## [1.2.0](https://github.com/OneEyed1366/wolf-tui/compare/react@v1.1.0...react@v1.2.0) (2026-03-15)

### Features

- add compound selector support and super-hybrid styling example ([ad66357](https://github.com/OneEyed1366/wolf-tui/commit/ad6635781611b203b75ec37bcdd431defae4f9ea))
- add React Compiler and reorganize dependencies ([9b314f9](https://github.com/OneEyed1366/wolf-tui/commit/9b314f97d0ef81caa4e28a742d9c7f3d68188ad9))
- add Tailwind CSS support and modern CSS utility parsing ([4e71bb2](https://github.com/OneEyed1366/wolf-tui/commit/4e71bb27b3ae893a815ca60f8c0a9a3976299f5b))
- add viewport units support (vw, vh, vmin, vmax) ([f6d87f1](https://github.com/OneEyed1366/wolf-tui/commit/f6d87f140194c4358d7a6b466dea63df3fb2431f))
- **css-parser:** unify vite plugins and improve example runner ([6022018](https://github.com/OneEyed1366/wolf-tui/commit/6022018f381912eeb2ae24d20dc3f6f9f6f9796f))
- implement portable webpack bundler example with native bindings and tailwind support ([9201852](https://github.com/OneEyed1366/wolf-tui/commit/92018529057d4d7dec7acebc948c109d545301bc))
- initial wolf-tui monorepo with core and react packages ([95f1add](https://github.com/OneEyed1366/wolf-tui/commit/95f1add80b867bc6c87c8fc3e48e87ee539ca8df))
- **plugin:** add nativeBindings option for automatic native asset handling ([514edff](https://github.com/OneEyed1366/wolf-tui/commit/514edff63ba2428e19dbbe00e450d4fbc33ae317))
- **plugin:** create unified @wolf-tui/plugin package with bundler-specific exports ([15f9fc3](https://github.com/OneEyed1366/wolf-tui/commit/15f9fc35c2880c75d5acdb8c5fcc00344b2ccda6))
- **react,vue:** add controlled value support for Select and MultiSelect ([20cd66b](https://github.com/OneEyed1366/wolf-tui/commit/20cd66be51a3a732ecf62ab78090ed54ea1c6fa6))
- **react:** add Badge, Spinner, ProgressBar, StatusMessage, Alert components ([d3b8c9e](https://github.com/OneEyed1366/wolf-tui/commit/d3b8c9ec84b01f263e649a3dc6c45326a049c314))
- **react:** add ConfirmInput, TextInput, PasswordInput, EmailInput components ([045cd37](https://github.com/OneEyed1366/wolf-tui/commit/045cd37d420ec06b0c8fe4be43221fa933029e0f))
- **react:** add dual-engine layout support with LayoutTree registry ([56e39d1](https://github.com/OneEyed1366/wolf-tui/commit/56e39d13f761619aafae01f63bec8fa868c61654))
- **react:** add examples for all new UI components ([2244b8e](https://github.com/OneEyed1366/wolf-tui/commit/2244b8e83dd79f7acf69011271dc1d2d1cc38418))
- **react:** add OrderedList and UnorderedList components ([9f39f5d](https://github.com/OneEyed1366/wolf-tui/commit/9f39f5d5c48093194a497776a016380f31eebd46))
- **react:** add pre-measurement strategy for Taffy text nodes ([68e139d](https://github.com/OneEyed1366/wolf-tui/commit/68e139d2d83ff921b44757e408547acade6a64f3))
- **react:** add runtime style registry and className prop support for CSS integration ([2207e6f](https://github.com/OneEyed1366/wolf-tui/commit/2207e6f0b9bfa50881a13e2a7787b40cf0fb6ae6))
- **react:** add Select and MultiSelect components ([7f5f528](https://github.com/OneEyed1366/wolf-tui/commit/7f5f528f908ed4849967c506d0a8770c29ee6bc4))
- **react:** add theme infrastructure for UI components ([3eeefd8](https://github.com/OneEyed1366/wolf-tui/commit/3eeefd80e345672ddfa914b6ebd209ddfe1e5720))
- retrofit vite and esbuild examples with portable native asset pattern ([489fc6c](https://github.com/OneEyed1366/wolf-tui/commit/489fc6c7f1b21c02b0cda0b2386c6abc1f4c0eff))
- **spec:** scaffold @wolf-tui/spec package with contracts and shared createStdout ([8d560c5](https://github.com/OneEyed1366/wolf-tui/commit/8d560c53289f1663780ed77a770227c9d96a3848))
- **vue:** add component library and comprehensive test suite (130 tests) ([7bd9446](https://github.com/OneEyed1366/wolf-tui/commit/7bd9446db6dfdd6ba43f9328f8b66fa2376c7dc5))
- **vue:** add SFC style support with CSS Modules and Tailwind integration ([02f21b7](https://github.com/OneEyed1366/wolf-tui/commit/02f21b7a1949239e92886118a539d803952f6e6e))
- **vue:** WIP ([e4a2a2e](https://github.com/OneEyed1366/wolf-tui/commit/e4a2a2e09f4b66302377f598f37b6f01286f4271))
- wrap TaffyLayoutTree with LoggedLayoutTree and add render cycle timing ([035847a](https://github.com/OneEyed1366/wolf-tui/commit/035847a22fd9e555c01ca32e6ad9975db1e29f9a))

### Bug Fixes

- Box style precedence and re-enable CSS Modules ([716ea53](https://github.com/OneEyed1366/wolf-tui/commit/716ea5313d30ae8f67dff55615b0ceac2f50eb18))
- **css-parser:** fix CSS module styles and add Tailwind caching ([1e3a24a](https://github.com/OneEyed1366/wolf-tui/commit/1e3a24a3333dfc41d47c4bef47d43084fa35e4a9))
- **plugin:** fix esbuild style modules and scoped rendering ([6741463](https://github.com/OneEyed1366/wolf-tui/commit/674146387598a51cd9d942600217af4f68135764))
- **react:** resolve IDE TypeScript errors for jsx and esModuleInterop ([93628a0](https://github.com/OneEyed1366/wolf-tui/commit/93628a0eb83039efb9a06927441620812ad14b95))
- resolve CSS import types and parser element-selector issues ([ac2f0ba](https://github.com/OneEyed1366/wolf-tui/commit/ac2f0ba275a11489a23a01988d190c42b1d4cc83))
- resolve styling warnings and enhance tailwind selector parsing ([0e768f9](https://github.com/OneEyed1366/wolf-tui/commit/0e768f9cd122910d8e5a295c201e7d693d2c5b91))
- resolve Tailwind config paths relative to config file directory ([a4c08b9](https://github.com/OneEyed1366/wolf-tui/commit/a4c08b94ec9a76c53335ab0ee91cbef93eb21504))
- **test:** add runtime PTY capability check to skip tests in unsupported environments ([ad32f83](https://github.com/OneEyed1366/wolf-tui/commit/ad32f830ae926246a6d2226847d12f98467009b8))
- **vue:** solve sfc reactivity and clean up types ([e40b252](https://github.com/OneEyed1366/wolf-tui/commit/e40b2527bfe6cfb4de76e8af57c04ca9334a9167))
- **webpack:** suppress ws optional dependency warnings ([2ccdc5b](https://github.com/OneEyed1366/wolf-tui/commit/2ccdc5b10b1f7395f6d3a0f42404be1ab23e4db1))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @wolf-tui/core bumped to 1.2.0
    - @wolf-tui/shared bumped to 1.2.0
  - devDependencies
    - @wolf-tui/css-parser bumped to 1.2.0
    - @wolf-tui/plugin bumped to 1.2.0
