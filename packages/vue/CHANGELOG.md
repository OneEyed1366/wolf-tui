# Changelog

## [1.3.0](https://github.com/OneEyed1366/wolf-tui/compare/vue@v1.2.1...vue@v1.3.0) (2026-03-26)

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

## [1.2.1](https://github.com/OneEyed1366/wolf-tui/compare/vue@v1.2.0...vue@v1.2.1) (2026-03-25)

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

## [1.2.0](https://github.com/OneEyed1366/wolf-tui/compare/vue@v1.1.0...vue@v1.2.0) (2026-03-15)

### Features

- **plugin:** add nativeBindings option for automatic native asset handling ([514edff](https://github.com/OneEyed1366/wolf-tui/commit/514edff63ba2428e19dbbe00e450d4fbc33ae317))
- **plugin:** create unified @wolf-tui/plugin package with bundler-specific exports ([15f9fc3](https://github.com/OneEyed1366/wolf-tui/commit/15f9fc35c2880c75d5acdb8c5fcc00344b2ccda6))
- **react,vue:** add controlled value support for Select and MultiSelect ([20cd66b](https://github.com/OneEyed1366/wolf-tui/commit/20cd66be51a3a732ecf62ab78090ed54ea1c6fa6))
- **spec:** scaffold @wolf-tui/spec package with contracts and shared createStdout ([8d560c5](https://github.com/OneEyed1366/wolf-tui/commit/8d560c53289f1663780ed77a770227c9d96a3848))
- **vue:** add component library and comprehensive test suite (130 tests) ([7bd9446](https://github.com/OneEyed1366/wolf-tui/commit/7bd9446db6dfdd6ba43f9328f8b66fa2376c7dc5))
- **vue:** add focus management system with useFocus and useFocusManager composables ([159b0b6](https://github.com/OneEyed1366/wolf-tui/commit/159b0b6248d9289fe3783264cbbd751a9aec9baf))
- **vue:** add SFC style support with CSS Modules and Tailwind integration ([02f21b7](https://github.com/OneEyed1366/wolf-tui/commit/02f21b7a1949239e92886118a539d803952f6e6e))
- **vue:** improve example app, fix background color reactivity ([b6820bc](https://github.com/OneEyed1366/wolf-tui/commit/b6820bcc47f7b524d7abe1e853e5ad8ac0db1db4))
- **vue:** instrument nodeOps with cat:vue log events ([23dac05](https://github.com/OneEyed1366/wolf-tui/commit/23dac05418f1be9157c9c5305c23d6fe3a62cd7c))
- **vue:** WIP ([e4a2a2e](https://github.com/OneEyed1366/wolf-tui/commit/e4a2a2e09f4b66302377f598f37b6f01286f4271))
- wrap TaffyLayoutTree with LoggedLayoutTree and add render cycle timing ([035847a](https://github.com/OneEyed1366/wolf-tui/commit/035847a22fd9e555c01ca32e6ad9975db1e29f9a))

### Bug Fixes

- **plugin:** fix esbuild style modules and scoped rendering ([6741463](https://github.com/OneEyed1366/wolf-tui/commit/674146387598a51cd9d942600217af4f68135764))
- **vue:** clear terminal on first render and suppress dev mode logs ([ed3da81](https://github.com/OneEyed1366/wolf-tui/commit/ed3da81a89484c027823bf53bce8a505de1f2df4))
- **vue:** fix raw mode subscription bug with watchEffect cleanup ([fdba269](https://github.com/OneEyed1366/wolf-tui/commit/fdba269e003694b902eff2d436fb734ab95ae037))
- **vue:** improve list components resilience and visual rendering ([ecc36a3](https://github.com/OneEyed1366/wolf-tui/commit/ecc36a3574d10cece4c5767ffeb1469b9a4c84b8))
- **vue:** propagate background color through nested Box components ([e337c71](https://github.com/OneEyed1366/wolf-tui/commit/e337c71c57ff1c6f2764d16dad07b8bcfd8cc137))
- **vue:** solve sfc reactivity and clean up types ([e40b252](https://github.com/OneEyed1366/wolf-tui/commit/e40b2527bfe6cfb4de76e8af57c04ca9334a9167))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @wolf-tui/core bumped to 1.2.0
    - @wolf-tui/shared bumped to 1.2.0
  - devDependencies
    - @wolf-tui/css-parser bumped to 1.2.0
    - @wolf-tui/plugin bumped to 1.2.0
