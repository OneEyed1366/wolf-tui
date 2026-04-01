import type { ILayer } from '../../types'

// Reference: examples/solid_invaders/vite.config.ts
export const solidViteInteraction: ILayer = {
	id: 'interaction:solid-vite',
	packageJson: {
		devDependencies: {
			'vite-plugin-solid': '^2.11.0',
		},
	},
	configPatches: [
		{
			target: 'vite.config.ts',
			slot: 'importsSlot',
			content:
				"import solidPlugin from 'vite-plugin-solid'\nimport { builtinModules } from 'node:module'",
			mode: 'add',
		},
		{
			target: 'vite.config.ts',
			slot: 'pluginsSlot',
			content: `solidPlugin({
			solid: {
				generate: 'universal',
				moduleName: '@wolf-tui/solid/renderer',
			},
		}),`,
			mode: 'add',
			priority: 10, // Must come BEFORE wolfie() (default 100)
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
				id === '@wolf-tui/solid' ||
				id.startsWith('@wolf-tui/solid/') ||
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
		alias: { 'solid-js': '@wolf-tui/solid' },
		conditions: ['browser', 'development'],
	},`,
			mode: 'add',
		},
	],
}
