import { defineConfig } from 'vite'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { wolfie } from '@wolfie/plugin/vite'
import { wolfiePreprocess } from '@wolfie/plugin/svelte'
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
		svelte({
			compilerOptions: { css: 'external' },
			preprocess: [vitePreprocess(), wolfiePreprocess()],
			dynamicCompileOptions() {
				return { generate: 'client' }
			},
		}),
		wolfie('svelte'),
	],
	css: { postcss: resolve(__dirname, 'postcss.config.cjs') },
	resolve: { conditions: ['browser', 'development'] },
	build: {
		target: 'node18',
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			preserveEntrySignatures: 'exports-only',
			external: (id) =>
				id === '@wolfie/svelte' ||
				id.startsWith('@wolfie/svelte/') ||
				id === 'svelte' ||
				id.startsWith('svelte/') ||
				nodeBuiltins.includes(id),
		},
	},
})
