import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { VERSIONS } from '../../versions.gen'
import { starterDir } from '../../paths'

const STARTER = starterDir('vue')

export const vueLayer: ILayer = {
	id: 'framework:vue',
	packageJson: {
		dependencies: {
			'@wolf-tui/vue': VERSIONS['@wolf-tui/vue'] ?? '^1.3.0',
			vue: '^3.5.0',
		},
		devDependencies: {
			'@vue/compiler-sfc': '^3.5.27',
		},
	},
	externals: ['vue', '@wolf-tui/vue'],
	templateVars: { entryExt: 'ts', entryFile: 'index.ts' },
	tsconfig: {
		compilerOptions: { jsx: 'preserve' },
	},
	files: {
		'src/index.ts': { type: 'static', source: resolve(STARTER, 'index.ts') },
		'src/App.vue': { type: 'static', source: resolve(STARTER, 'App.vue') },
	},
}

export default vueLayer
