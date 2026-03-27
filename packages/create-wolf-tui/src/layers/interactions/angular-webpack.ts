import type { ILayer } from '../../types'

// Reference: examples/angular_webpack/webpack.config.js
export const angularWebpackInteraction: ILayer = {
	id: 'interaction:angular-webpack',
	configPatches: [
		{
			target: 'webpack.config.js',
			slot: 'externalsOverride',
			content: `externals: {
		'@angular/core': 'commonjs @angular/core',
		'@angular/common': 'commonjs @angular/common',
		'@angular/compiler': 'commonjs @angular/compiler',
		'zone.js': 'commonjs zone.js',
		'rxjs': 'commonjs rxjs',
		'@wolf-tui/angular': 'commonjs @wolf-tui/angular',
	},`,
			mode: 'override',
		},
	],
}
