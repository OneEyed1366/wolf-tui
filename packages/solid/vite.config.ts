import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { wolfie } from '@wolf-tui/plugin/vite'
import { createDtsPlugin } from '@wolf-tui/build-config'

export default defineConfig({
	resolve: {
		conditions: ['browser', 'development'],
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.tsx'),
			formats: ['es'],
			fileName: 'index',
		},
		outDir: 'build',
		sourcemap: true,
		minify: false,
		target: 'node20',
		rollupOptions: {
			input: {
				index: resolve(__dirname, 'src/index.tsx'),
				'renderer/index': resolve(__dirname, 'src/renderer/index.ts'),
				'styles/index': resolve(__dirname, 'src/styles/index.ts'),
			},
			output: {
				preserveModules: true,
				preserveModulesRoot: 'src',
				entryFileNames: '[name].js',
			},
			external: (id) => {
				if (id.startsWith('node:')) return true
				if (id.startsWith('.') || id.startsWith('/')) return false
				// Bundle solid-js into the package (Node resolves to server build which breaks reactivity)
				if (id === 'solid-js' || id.startsWith('solid-js/')) return false
				return true
			},
		},
	},
	plugins: [
		wolfie('solid'),
		solidPlugin({
			solid: {
				moduleName: '@wolf-tui/solid/renderer',
				generate: 'universal',
			},
		}),
		createDtsPlugin(),
	],
})
