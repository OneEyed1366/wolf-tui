import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { wolfie } from '@wolf-tui/plugin/vite'
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
				'styles/index': resolve(__dirname, 'src/styles/index.ts'),
			},
			output: {
				// Maintain file structure for better tree-shaking
				preserveModules: true,
				preserveModulesRoot: 'src',
				entryFileNames: '[name].js',
			},
			// Externalize all dependencies - library consumers will provide them
			external: (id) => {
				if (id.startsWith('node:')) return true
				if (id.startsWith('.') || id.startsWith('/')) return false
				return true
			},
		},
	},
	plugins: [
		wolfie('vue'),
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('wolfie-'),
				},
			},
		}),
		vueJsx({
			isCustomElement: (tag) => tag.startsWith('wolfie-'),
		}),
		createDtsPlugin(),
	],
})
