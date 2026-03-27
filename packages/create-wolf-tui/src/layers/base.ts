import { resolve } from 'node:path'
import type { ILayer } from '../types'
import { VERSIONS } from '../versions.gen'
import { TEMPLATE_FILES } from '../paths'

export const baseLayer: ILayer = {
	id: 'base',
	packageJson: {
		devDependencies: {
			typescript: '^5.8.3',
			'@wolf-tui/plugin': VERSIONS['@wolf-tui/plugin'] ?? '^1.3.0',
			'@wolf-tui/typescript-plugin':
				VERSIONS['@wolf-tui/typescript-plugin'] ?? '^1.1.0',
		},
	},
	tsconfig: {
		compilerOptions: {
			target: 'ES2022',
			module: 'ESNext',
			moduleResolution: 'bundler',
			strict: true,
			esModuleInterop: true,
			skipLibCheck: true,
		},
		include: ['src'],
	},
	files: {
		'.gitignore': {
			type: 'static',
			source: resolve(TEMPLATE_FILES, 'gitignore'),
		},
	},
}
