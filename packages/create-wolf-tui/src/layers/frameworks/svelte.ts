import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { VERSIONS } from '../../versions.gen'
import { TEMPLATE_FILES } from '../../paths'

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
	templateVars: {
		entryExt: 'ts',
		entryFile: 'index.ts',
		brandColor: '#FF3E00',
		brandName: 'Svelte',
	},
	files: {
		'src/index.ts': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'entry-svelte.ts.ejs'),
		},
		'src/App.svelte': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'app-svelte.svelte.ejs'),
		},
	},
}

export default svelteLayer
