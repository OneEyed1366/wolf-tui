import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { VERSIONS } from '../../versions.gen'
import { starterDir } from '../../paths'

const STARTER = starterDir('react')

export const reactLayer: ILayer = {
	id: 'framework:react',
	packageJson: {
		dependencies: {
			'@wolf-tui/react': VERSIONS['@wolf-tui/react'] ?? '^1.3.0',
			react: '^19.0.0',
		},
	},
	externals: [
		'react',
		'react/jsx-runtime',
		'react/jsx-dev-runtime',
		'@wolf-tui/react',
	],
	templateVars: { entryExt: 'tsx', entryFile: 'index.tsx' },
	tsconfig: {
		compilerOptions: { jsx: 'react-jsx' },
	},
	files: {
		'src/index.tsx': { type: 'static', source: resolve(STARTER, 'index.tsx') },
		'src/App.tsx': { type: 'static', source: resolve(STARTER, 'App.tsx') },
	},
}

export default reactLayer
