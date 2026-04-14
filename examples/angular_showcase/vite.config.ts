import { defineConfig } from 'vite'
import { wolfie } from '@wolf-tui/plugin/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [wolfie('angular')],
	build: {
		target: 'node20',
		ssr: resolve(__dirname, 'src/index.ts'),
		rollupOptions: {
			preserveEntrySignatures: 'exports-only',
			output: {
				format: 'cjs',
				entryFileNames: 'index.cjs',
			},
			external: [
				'@angular/core',
				'@angular/common',
				'@wolf-tui/angular',
				'zone.js',
				'@angular/compiler',
			],
		},
	},
})
