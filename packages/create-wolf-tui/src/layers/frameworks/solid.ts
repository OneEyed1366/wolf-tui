import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { VERSIONS } from '../../versions.gen'
import { TEMPLATE_FILES } from '../../paths'

export const solidLayer: ILayer = {
	id: 'framework:solid',
	packageJson: {
		dependencies: {
			'@wolf-tui/solid': VERSIONS['@wolf-tui/solid'] ?? '^1.3.0',
			'solid-js': '^1.9.0',
		},
	},
	externals: ['solid-js', '@wolf-tui/solid'],
	templateVars: {
		entryExt: 'tsx',
		entryFile: 'index.tsx',
		brandColor: '#2C4F7C',
		brandName: 'Solid',
	},
	tsconfig: {
		compilerOptions: { jsx: 'preserve', jsxImportSource: 'solid-js' },
	},
	files: {
		'src/index.tsx': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'entry-solid.tsx.ejs'),
		},
		'src/App.tsx': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'app-solid.tsx.ejs'),
		},
	},
}

export default solidLayer
