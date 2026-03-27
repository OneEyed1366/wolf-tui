import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { VERSIONS } from '../../versions.gen'
import { starterDir } from '../../paths'

const STARTER = starterDir('svelte')

export const svelteLayer: ILayer = {
	id: 'framework:svelte',
	packageJson: {
		dependencies: {
			'@wolf-tui/svelte': VERSIONS['@wolf-tui/svelte'] ?? '^1.1.0',
			svelte: '^5.0.0',
		},
	},
	externals: [
		'svelte',
		'svelte/internal',
		'svelte/internal/client',
		'@wolf-tui/svelte',
	],
	templateVars: { entryExt: 'ts', entryFile: 'index.ts' },
	files: {
		'src/index.ts': { type: 'static', source: resolve(STARTER, 'index.ts') },
		'src/App.svelte': {
			type: 'static',
			source: resolve(STARTER, 'App.svelte'),
		},
	},
}

export default svelteLayer
