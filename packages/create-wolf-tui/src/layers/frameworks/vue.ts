import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { VERSIONS } from '../../versions.gen'
import { TEMPLATE_FILES } from '../../paths'

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
	templateVars: {
		entryExt: 'ts',
		entryFile: 'index.ts',
		brandColor: '#42B883',
		brandName: 'Vue',
	},
	tsconfig: {
		compilerOptions: { jsx: 'preserve' },
	},
	files: {
		'src/index.ts': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'entry-vue.ts.ejs'),
		},
		'src/App.vue': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'app-vue.vue.ejs'),
		},
	},
}

export default vueLayer
