import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { wolfie } from '@wolf-tui/plugin/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { builtinModules } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))

const nodeBuiltins = [
	...builtinModules,
	...builtinModules.map((m) => `node:${m}`),
]

export default defineConfig({
	root: __dirname,
	plugins: [
		solidPlugin({
			solid: {
				moduleName: '@wolf-tui/solid/renderer',
				generate: 'universal',
			},
		}),
		wolfie('solid'),
	],
	resolve: {
		alias: {
			'solid-js': '@wolf-tui/solid',
		},
	},
	build: {
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
				nodeBuiltins.includes(id),
		},
	},
})
