import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
				vite: resolve(__dirname, 'src/vite.ts'),
				esbuild: resolve(__dirname, 'src/esbuild.ts'),
				webpack: resolve(__dirname, 'src/webpack.ts'),
				rollup: resolve(__dirname, 'src/rollup.ts'),
				svelte: resolve(__dirname, 'src/svelte.ts'),
				'svelte-preprocess': resolve(__dirname, 'src/svelte-preprocess.ts'),
				'svelte-sfc': resolve(__dirname, 'src/svelte-sfc.ts'),
			},
			formats: ['es'],
		},
		outDir: 'build',
		sourcemap: true,
		minify: false,
		target: 'node20',
		rollupOptions: {
			// Externalize all dependencies - library consumers will provide them
			external: (id) => {
				if (id.startsWith('node:')) return true
				if (id.startsWith('.') || id.startsWith('/')) return false
				return true
			},
		},
	},
	plugins: [dts({ rollupTypes: false })],
})
