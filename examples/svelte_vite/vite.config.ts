import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { wolfie } from '@wolfie/plugin/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { builtinModules } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))

const nodeBuiltins = [
	...builtinModules,
	...builtinModules.map((m) => `node:${m}`),
]

export default defineConfig({
	plugins: [
		// WHY: No compilerOptions override needed. Default 'html' mode emits
		// from_html() + template.innerHTML which WolfieTemplateElement handles.
		svelte(),
		wolfie('svelte'),
	],
	build: {
		target: 'node20',
		lib: {
			entry: resolve(__dirname, 'index.ts'),
			formats: ['cjs'],
			fileName: 'index',
		},
		rollupOptions: {
			external: (id) => {
				if (nodeBuiltins.includes(id)) return true
				// WHY: Keep all external deps including @wolfie/svelte and svelte.
				// verify.cjs uses --conditions=browser (Node 22) so require('@wolfie/svelte')
				// resolves svelte → index-client.js (has mount()) at runtime.
				return !id.startsWith('.') && !id.startsWith('/')
			},
		},
	},
})
