import type { ILayer } from '../../types'

// Reference: examples/react_invaders/vite.config.ts
export const reactViteInteraction: ILayer = {
	id: 'interaction:react-vite',
	configPatches: [
		{
			target: 'vite.config.ts',
			slot: 'importsSlot',
			content: "import { builtinModules } from 'node:module'",
			mode: 'add',
		},
		{
			target: 'vite.config.ts',
			slot: 'buildOverride',
			content: `build: {
		target: 'node18',
		lib: {
			entry: resolve(__dirname, 'src/index.tsx'),
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			preserveEntrySignatures: 'exports-only',
			external: (id) =>
				id === 'react' ||
				id.startsWith('react/') ||
				id === '@wolf-tui/react' ||
				id.startsWith('@wolf-tui/react/') ||
				builtinModules.includes(id) ||
				id.startsWith('node:'),
		},
	},`,
			mode: 'override',
		},
		{
			target: 'vite.config.ts',
			slot: 'extraConfigSlot',
			content: `resolve: {
		// Force Node-target resolution conditions so transitive deps (e.g. cfonts ->
		// chalk -> supports-color) pick their Node entry instead of the browser one.
		// Without this, supports-color/browser.js leaks navigator.userAgent into the
		// bundle and crashes at module-init in a Node runtime.
		conditions: ['node', 'import', 'module', 'default'],
	},`,
			mode: 'add',
		},
	],
}
