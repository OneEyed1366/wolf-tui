import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import dts from 'vite-plugin-dts'
import { wolfie } from '@wolfie/plugin/vite'

export default defineConfig({
	resolve: {
		conditions: ['browser', 'development'],
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'index',
		},
		outDir: 'build',
		sourcemap: true,
		minify: false,
		target: 'node20',
		rollupOptions: {
			input: {
				index: resolve(__dirname, 'src/index.ts'),
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
				// Bundle svelte into the package (Node resolves to server build which breaks reactivity)
				if (id === 'svelte' || id.startsWith('svelte/')) return false
				return true
			},
		},
	},
	plugins: [
		wolfie('svelte'),
		svelte({
			compilerOptions: {
				customElement: false,
				css: 'external',
			},
		}),
		dts({ rollupTypes: false }),
	],
})
