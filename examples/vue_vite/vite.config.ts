import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { wolfie } from '@wolf-tui/plugin/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) =>
						tag.startsWith('wolfie-') || tag.startsWith('Wolfie'),
					hoistStatic: false,
				},
			},
		}),
		wolfie('vue'),
	],
	css: {
		postcss: resolve(__dirname, 'postcss.config.cjs'),
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'index.ts'),
			formats: ['cjs'],
			fileName: 'index',
		},
		rollupOptions: {
			external: [/^vue(\/|$)/, /^@wolf-tui\//],
		},
	},
})
