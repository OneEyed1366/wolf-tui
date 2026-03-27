import type { ILayer } from '../../types'

// Reference: examples/solid_esbuild/build.mjs
export const solidEsbuildInteraction: ILayer = {
	id: 'interaction:solid-esbuild',
	packageJson: {
		devDependencies: {
			'esbuild-plugin-solid': '^0.6.0',
		},
	},
	configPatches: [
		{
			target: 'build.js',
			slot: 'importsSlot',
			content: "import { solidPlugin } from 'esbuild-plugin-solid'",
			mode: 'add',
		},
		{
			target: 'build.js',
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
	],
}
