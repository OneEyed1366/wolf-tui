import { resolve } from 'node:path'
import type { Framework, ILayer } from '../types'
import { TEMPLATE_FILES } from '../paths'

export function lintLayer(framework: Framework): ILayer {
	const devDeps: Record<string, string> = {
		eslint: '^9.18.0',
		'@eslint/js': '^9.18.0',
		'typescript-eslint': '^8.21.0',
		prettier: '^3.3.3',
	}

	if (framework === 'react') {
		devDeps['eslint-plugin-react'] = '^7.37.0'
		devDeps['eslint-plugin-react-hooks'] = '^5.1.0'
	}
	if (framework === 'vue') {
		devDeps['eslint-plugin-vue'] = '^9.31.0'
	}
	if (framework === 'svelte') {
		devDeps['eslint-plugin-svelte'] = '^2.46.0'
	}

	return {
		id: 'lint',
		packageJson: {
			devDependencies: devDeps,
			scripts: {
				lint: 'eslint .',
				format: 'prettier --write .',
			},
		},
		files: {
			'eslint.config.js': {
				type: 'template',
				source: resolve(TEMPLATE_FILES, 'eslint.config.js.ejs'),
				data: { framework },
			},
			'.prettierrc.json': {
				type: 'static',
				source: resolve(TEMPLATE_FILES, 'prettierrc.json'),
			},
		},
	}
}
