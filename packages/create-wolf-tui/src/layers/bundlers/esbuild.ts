import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { TEMPLATE_FILES } from '../../paths'

export const esbuildLayer: ILayer = {
	id: 'bundler:esbuild',
	packageJson: {
		devDependencies: {
			esbuild: '^0.24.0',
		},
		scripts: {
			build: 'node build.js',
			start: 'node dist/index.cjs',
			dev: 'node build.js && node dist/index.cjs',
		},
	},
	templateVars: {
		outputFormat: 'cjs',
		outputExt: 'cjs',
	},
	files: {
		'build.js': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'build.js.ejs'),
		},
	},
}

export default esbuildLayer
