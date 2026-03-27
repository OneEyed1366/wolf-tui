import type { ILayer } from '../../types'

// Reference: examples/vue_vite/vite.config.ts
export const vueViteInteraction: ILayer = {
	id: 'interaction:vue-vite',
	packageJson: {
		devDependencies: {
			'@vitejs/plugin-vue': '^5.0.0',
		},
		scripts: {
			start: 'node dist/index.cjs',
			dev: 'vite build && node dist/index.cjs',
		},
	},
	configPatches: [
		{
			target: 'vite.config.ts',
			slot: 'importsSlot',
			content: "import vue from '@vitejs/plugin-vue'",
			mode: 'add',
		},
		{
			target: 'vite.config.ts',
			slot: 'pluginsSlot',
			content: `vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('wolfie-') || tag.startsWith('Wolfie'),
					hoistStatic: false,
				},
			},
		}),`,
			mode: 'add',
		},
		{
			target: 'vite.config.ts',
			slot: 'buildOverride',
			content: `build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['cjs'],
			fileName: 'index',
		},
		rollupOptions: {
			external: [/^vue(\\/|$)/, /^@wolf-tui\\//],
		},
	},`,
			mode: 'override',
		},
	],
}
