import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { createDtsPlugin } from '@wolf-tui/build-config'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/core/index.ts'),
			formats: ['es'],
			fileName: 'index',
		},
		outDir: 'build',
		sourcemap: true,
		minify: false,
		target: 'node20',
		rollupOptions: {
			input: {
				'core/index': resolve(__dirname, 'src/core/index.ts'),
				'react/index': resolve(__dirname, 'src/react/index.ts'),
				'vue/index': resolve(__dirname, 'src/vue/index.ts'),
				'angular/index': resolve(__dirname, 'src/angular/index.ts'),
				'solid/index': resolve(__dirname, 'src/solid/index.ts'),
				'svelte/index': resolve(__dirname, 'src/svelte/index.ts'),
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
