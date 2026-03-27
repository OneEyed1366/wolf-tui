import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { VERSIONS } from '../../versions.gen'
import { starterDir } from '../../paths'

const STARTER = starterDir('solid')

export const solidLayer: ILayer = {
	id: 'framework:solid',
	packageJson: {
		dependencies: {
			'@wolf-tui/solid': VERSIONS['@wolf-tui/solid'] ?? '^1.3.0',
			'solid-js': '^1.9.0',
		},
	},
	externals: ['solid-js', '@wolf-tui/solid'],
	templateVars: { entryExt: 'tsx', entryFile: 'index.tsx' },
	tsconfig: {
		compilerOptions: { jsx: 'preserve', jsxImportSource: 'solid-js' },
	},
	files: {
		'src/index.tsx': { type: 'static', source: resolve(STARTER, 'index.tsx') },
		'src/App.tsx': { type: 'static', source: resolve(STARTER, 'App.tsx') },
	},
}

export default solidLayer
