import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { createDtsPlugin } from '@wolf-tui/build-config'

export default defineConfig({
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
			},
			output: {
				preserveModules: true,
				preserveModulesRoot: 'src',
				entryFileNames: '[name].js',
			},
			external: (id) => {
				if (id.startsWith('node:')) return true
				if (id.startsWith('.') || id.startsWith('/')) return false
				return true
			},
		},
	},
	plugins: [createDtsPlugin()],
})
