import type { ILayer } from '../../types'

// Reference: examples/svelte_esbuild/build.mjs
export const svelteEsbuildInteraction: ILayer = {
	id: 'interaction:svelte-esbuild',
	packageJson: {
		devDependencies: {
			'esbuild-svelte': '^0.9.4',
			'svelte-preprocess': '^6.0.0',
		},
		scripts: {
			start: 'node --conditions=browser dist/index.js',
			dev: 'node build.js && node --conditions=browser dist/index.js',
		},
	},
	templateVars: {
		outputFormat: 'esm',
		outputExt: 'js',
		needsCreateRequire: true,
	},
	configPatches: [
		{
			target: 'build.js',
			slot: 'importsSlot',
			content: `import sveltePlugin from 'esbuild-svelte'
import { sveltePreprocess } from 'svelte-preprocess'`,
			mode: 'add',
		},
		{
			target: 'build.js',
			slot: 'pluginsSlot',
			content: `sveltePlugin({
			compilerOptions: { generate: 'client', css: 'external' },
			preprocess: sveltePreprocess(),
		}),`,
			mode: 'add',
		},
		{
			target: 'build.js',
			slot: 'extraSlot',
			content: `conditions: ['svelte', 'browser'],
	mainFields: ['svelte', 'browser', 'module', 'main'],
	packages: 'external',`,
			mode: 'add',
		},
	],
}
