import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { VERSIONS } from '../../versions.gen'
import { TEMPLATE_FILES } from '../../paths'

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
	templateVars: {
		entryExt: 'tsx',
		entryFile: 'index.tsx',
		brandColor: '#61DAFB',
		brandName: 'React',
	},
	tsconfig: {
		compilerOptions: { jsx: 'react-jsx' },
	},
	files: {
		'src/index.tsx': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'entry-react.tsx.ejs'),
		},
		'src/App.tsx': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'app-react.tsx.ejs'),
		},
	},
}

export default reactLayer
