import { defineConfig } from 'vite'
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
	plugins: [wolfie('react')],
	css: {
		postcss: resolve(__dirname, 'postcss.config.cjs'),
	},
	resolve: {
		// Force Node-target resolution conditions so transitive deps (e.g. cfonts ->
		// chalk -> supports-color) pick their Node entry instead of the browser one.
		// Without this, supports-color/browser.js leaks `navigator.userAgent` into
		// the bundle and crashes at module-init in a Node runtime.
		conditions: ['node', 'import', 'module', 'default'],
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
			external: [
				'react',
				'react/jsx-runtime',
				'react/jsx-dev-runtime',
				'@wolf-tui/react',
				...nodeBuiltins,
			],
		},
	},
})
