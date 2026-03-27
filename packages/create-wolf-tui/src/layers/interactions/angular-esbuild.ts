import type { ILayer } from '../../types'

// Reference: examples/angular_esbuild/esbuild.config.js
// Angular esbuild uses nativeBindings: false — already handled by
// the esbuild.js.ejs template's framework === 'angular' check.
// This layer is a no-op but exists for registry completeness.
export const angularEsbuildInteraction: ILayer = {
	id: 'interaction:angular-esbuild',
}
