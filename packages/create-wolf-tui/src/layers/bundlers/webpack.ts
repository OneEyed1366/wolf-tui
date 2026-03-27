import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { TEMPLATE_FILES } from '../../paths'

export const webpackLayer: ILayer = {
	id: 'bundler:webpack',
	packageJson: {
		devDependencies: {
			webpack: '^5.91.0',
			'webpack-cli': '^5.1.4',
			'ts-loader': '^9.5.1',
		},
		scripts: {
			build: 'webpack',
			start: 'node dist/index.cjs',
			dev: 'webpack && node dist/index.cjs',
		},
	},
	templateVars: {
		outputFormat: 'commonjs',
		outputExt: 'cjs',
	},
	files: {
		'webpack.config.js': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'webpack.config.js.ejs'),
		},
	},
}

export default webpackLayer
