import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { TEMPLATE_FILES } from '../../paths'

export const viteLayer: ILayer = {
	id: 'bundler:vite',
	packageJson: {
		devDependencies: {
			vite: '^6.0.0',
		},
		scripts: {
			build: 'vite build',
			start: 'node dist/index.js',
			dev: 'vite build && node dist/index.js',
		},
	},
	templateVars: {
		outputFormat: 'esm',
		outputExt: 'js',
	},
	files: {
		'env.d.ts': {
			type: 'static',
			source: resolve(TEMPLATE_FILES, 'env.d.ts'),
		},
		'vite.config.ts': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'vite.config.ts.ejs'),
		},
	},
}

export default viteLayer
