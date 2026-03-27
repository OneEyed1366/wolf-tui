# Changelog

## [1.3.2](https://github.com/OneEyed1366/wolf-tui/compare/angular@v1.3.1...angular@v1.3.2) (2026-03-27)


### Bug Fixes

* **core:** cross-platform native bindings + lazy CSS preprocessors ([#12](https://github.com/OneEyed1366/wolf-tui/issues/12)) ([a11cd48](https://github.com/OneEyed1366/wolf-tui/commit/a11cd484ac298b1e0b6774beaf23a6a323098318))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @wolf-tui/core bumped to 1.3.2
    * @wolf-tui/shared bumped to 1.3.2
  * devDependencies
    * @wolf-tui/css-parser bumped to 1.3.2
    * @wolf-tui/plugin bumped to 1.3.2

## [1.3.0](https://github.com/OneEyed1366/wolf-tui/compare/angular@v1.2.1...angular@v1.3.0) (2026-03-26)

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

## [1.2.1](https://github.com/OneEyed1366/wolf-tui/compare/angular@v1.2.0...angular@v1.2.1) (2026-03-25)

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

## [1.2.0](https://github.com/OneEyed1366/wolf-tui/compare/angular@v1.1.0...angular@v1.2.0) (2026-03-15)

### Features

- **angular:** add Angular 17+ support with custom Renderer2 ([635e240](https://github.com/OneEyed1366/wolf-tui/commit/635e240f5ebb108a36b42c15381828310499818e))
- **angular:** add esbuild example ([3e92f5e](https://github.com/OneEyed1366/wolf-tui/commit/3e92f5ed84062c8f9b6b8adea528cad7ca528f9d))
- **angular:** add missing components matching React/Vue parity ([c3cf4f0](https://github.com/OneEyed1366/wolf-tui/commit/c3cf4f0d4c6975cd76c0a776645914141524930f))
- **angular:** add Tab focus navigation for inputs and fix effect() support ([49f3f11](https://github.com/OneEyed1366/wolf-tui/commit/49f3f11b79954601add2ef2858a7210ec0ac7b2a))
- **angular:** add theme system with component theming support ([969a769](https://github.com/OneEyed1366/wolf-tui/commit/969a769bb7c2941e884bb1d2b36b51723c4c8a6e))
- **angular:** add webpack example ([bb63c72](https://github.com/OneEyed1366/wolf-tui/commit/bb63c727b178a73fc1940e472d444cfadf302c26))
- **angular:** instrument WolfieRenderer with cat:angular log events ([564c5f9](https://github.com/OneEyed1366/wolf-tui/commit/564c5f98d2614f3a5512229ea6da8c0a6bcba275))
- **angular:** update example app to use new components ([54b591e](https://github.com/OneEyed1366/wolf-tui/commit/54b591ed81146bccef1d5505f989fc618e15b586))
- **spec:** scaffold @wolf-tui/spec package with contracts and shared createStdout ([8d560c5](https://github.com/OneEyed1366/wolf-tui/commit/8d560c53289f1663780ed77a770227c9d96a3848))
- wrap TaffyLayoutTree with LoggedLayoutTree and add render cycle timing ([035847a](https://github.com/OneEyed1366/wolf-tui/commit/035847a22fd9e555c01ca32e6ad9975db1e29f9a))

### Bug Fixes

- **angular:** fix Select/MultiSelect input handling when isDisabled changes ([74985ee](https://github.com/OneEyed1366/wolf-tui/commit/74985eeeccbb41cd0372b4b558adbf5d813e12c4))
- **angular:** map all component selectors to valid ElementNames (wolfie-box) ([7e6f61c](https://github.com/OneEyed1366/wolf-tui/commit/7e6f61cb91cad9d5dacc5d436fd8ec7ce82f711a))
- **angular:** provide THEME_CONTEXT in renderWolfie for null-parent injector ([eb6f4f2](https://github.com/OneEyed1366/wolf-tui/commit/eb6f4f29277dfd6bafbbb7820eebb7241788f0e8))
- **angular:** refresh capturedStyle/capturedClassName on input changes ([4cdd549](https://github.com/OneEyed1366/wolf-tui/commit/4cdd549fe632d97f8337427484add27ff60e724b))
- **angular:** resolve className to styles in TextComponent ([0ed454f](https://github.com/OneEyed1366/wolf-tui/commit/0ed454f03c79f3c989fb470654500720f2b19166))
- **angular:** run input handlers inside NgZone for change detection ([fcaa0d4](https://github.com/OneEyed1366/wolf-tui/commit/fcaa0d4b59212b34c89e2d217ba8cc4b9b71fd4f))
- **angular:** trigger change detection after input handlers and handle null nodes in renderer ([816c074](https://github.com/OneEyed1366/wolf-tui/commit/816c0742700ac7c091302b880b4d378ea84a409f))
- **angular:** use detectChanges for timer-based animations in OnPush components ([3950d8e](https://github.com/OneEyed1366/wolf-tui/commit/3950d8ee7e85a1c80be0837f8b00337d1a3650d8))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @wolf-tui/core bumped to 1.2.0
    - @wolf-tui/shared bumped to 1.2.0
  - devDependencies
    - @wolf-tui/css-parser bumped to 1.2.0
    - @wolf-tui/plugin bumped to 1.2.0
