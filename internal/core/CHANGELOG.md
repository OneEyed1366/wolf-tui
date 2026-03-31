# Changelog

## [1.3.2](https://github.com/OneEyed1366/wolf-tui/compare/core@v1.3.1...core@v1.3.2) (2026-03-27)

### Bug Fixes

- **core:** cross-platform native bindings + lazy CSS preprocessors ([#12](https://github.com/OneEyed1366/wolf-tui/issues/12)) ([a11cd48](https://github.com/OneEyed1366/wolf-tui/commit/a11cd484ac298b1e0b6774beaf23a6a323098318))

## [1.3.1](https://github.com/OneEyed1366/wolf-tui/compare/core@v1.3.0...core@v1.3.1) (2026-03-27)

### Bug Fixes

- cross-platform native builds + lazy-load CSS preprocessors ([#10](https://github.com/OneEyed1366/wolf-tui/issues/10)) ([e019f4e](https://github.com/OneEyed1366/wolf-tui/commit/e019f4e5977d0d44de03309680a92cf1fae3d8b4))

## [1.3.0](https://github.com/OneEyed1366/wolf-tui/compare/core@v1.2.1...core@v1.3.0) (2026-03-26)

### Features

- move chalk to auto-installed dependency ([84cf659](https://github.com/OneEyed1366/wolf-tui/commit/84cf659471ed8c96699720666cd860acdddc616a))

## [1.2.1](https://github.com/OneEyed1366/wolf-tui/compare/core@v1.2.0...core@v1.2.1) (2026-03-25)

### Features

- add Svelte 5 adapter with complete DOM shim ([#4](https://github.com/OneEyed1366/wolf-tui/issues/4)) ([f34c6c3](https://github.com/OneEyed1366/wolf-tui/commit/f34c6c3c758cfb6c9ac1fb0ecd94ace4d4929b03))

## [1.2.0](https://github.com/OneEyed1366/wolf-tui/compare/core@v1.1.0...core@v1.2.0) (2026-03-15)

### Features

- **core:** add createLogger factory and logger singleton for WOLFIE_LOG ([cb0e969](https://github.com/OneEyed1366/wolf-tui/commit/cb0e969559cb85f33ef07718f738f59446e723e8))
- **core:** add LoggedLayoutTree decorator for layout event capture ([33260f5](https://github.com/OneEyed1366/wolf-tui/commit/33260f537c6b32735b0f16c8fe4b7f1790ed320d))
- **core:** export logger and LoggedLayoutTree from @wolf-tui/core ([dc8f025](https://github.com/OneEyed1366/wolf-tui/commit/dc8f025e90a52b87ad1362e452ed591be5206db1))
- **core:** instrument dom.ts with cat:dom log events ([e444530](https://github.com/OneEyed1366/wolf-tui/commit/e4445301dd913abf183105cabf38fb33f175ea93))
- **core:** instrument measureText and wrapText with cat:measure log events ([2308a60](https://github.com/OneEyed1366/wolf-tui/commit/2308a603b086facd941842927aed7ed2bd905c19))
- **core:** log inputStyle+taffyStyle in applyLayoutStyle for cross-adapter comparison ([49f7078](https://github.com/OneEyed1366/wolf-tui/commit/49f7078df389a4ff47884bc1dc8a93eb2b1cbb42))
- **logger:** add input category for key event tracing ([6a99960](https://github.com/OneEyed1366/wolf-tui/commit/6a999606f77a13e98f89b4c9b3d67f8a39f609a5))
- **plugin:** add solid to Framework type and LogCategory ([10af364](https://github.com/OneEyed1366/wolf-tui/commit/10af364cbf439e588415fdc3e5af4148da1d65a4))
- **vue:** add component library and comprehensive test suite (130 tests) ([7bd9446](https://github.com/OneEyed1366/wolf-tui/commit/7bd9446db6dfdd6ba43f9328f8b66fa2376c7dc5))
- **vue:** improve example app, fix background color reactivity ([b6820bc](https://github.com/OneEyed1366/wolf-tui/commit/b6820bcc47f7b524d7abe1e853e5ad8ac0db1db4))

### Bug Fixes

- **solid:** coerce non-string text nodes to string in createTextNode/replaceText ([97ff82d](https://github.com/OneEyed1366/wolf-tui/commit/97ff82d17dca5e540aff4717393925c972f5dad2))
