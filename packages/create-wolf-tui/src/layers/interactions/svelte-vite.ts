import type { ILayer } from '../../types'

// Reference: examples/svelte_vite/vite.config.ts
export const svelteViteInteraction: ILayer = {
	id: 'interaction:svelte-vite',
	packageJson: {
		devDependencies: {
			'@sveltejs/vite-plugin-svelte': '^5.0.0',
		},
		scripts: {
			start: 'node --conditions=browser dist/index.js',
			dev: 'vite build && node --conditions=browser dist/index.js',
		},
	},
	configPatches: [
		{
			target: 'vite.config.ts',
			slot: 'importsSlot',
			content: `import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { wolfiePreprocess } from '@wolf-tui/plugin/svelte'
import { builtinModules } from 'node:module'`,
			mode: 'add',
		},
		{
			target: 'vite.config.ts',
			slot: 'pluginsSlot',
			content: `svelte({
			compilerOptions: { css: 'external' },
			preprocess: [vitePreprocess(), wolfiePreprocess()],
			dynamicCompileOptions() {
				return { generate: 'client' }
			},
		}),`,
			mode: 'add',
		},
		{
			target: 'vite.config.ts',
			slot: 'buildOverride',
			content: `build: {
		target: 'node18',
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			preserveEntrySignatures: 'exports-only',
			external: (id) =>
				id === '@wolf-tui/svelte' ||
				id.startsWith('@wolf-tui/svelte/') ||
				id === 'svelte' ||
				id.startsWith('svelte/') ||
				builtinModules.includes(id) ||
				id.startsWith('node:'),
		},
	},`,
			mode: 'override',
		},
		{
			target: 'vite.config.ts',
			slot: 'extraConfigSlot',
			content: "resolve: { conditions: ['browser', 'development'] },",
			mode: 'add',
		},
	],
}
