import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: './src/index.ts',
			formats: ['cjs'],
			fileName: () => 'index.js',
		},
		outDir: 'build',
		minify: false,
		rollupOptions: {
			external: ['typescript', /^@wolf-tui\//],
		},
	},
	plugins: [
		dts({
			rollupTypes: true,
		}),
	],
})
