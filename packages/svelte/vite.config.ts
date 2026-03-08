import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import dts from 'vite-plugin-dts'
import { wolfie } from '@wolfie/plugin/vite'

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
				preserveModules: true,
				preserveModulesRoot: 'src',
				entryFileNames: '[name].js',
			},
			external: (id) => {
				if (id.startsWith('node:')) return true
				if (id.startsWith('.') || id.startsWith('/')) return false
				// WHY: Svelte is a peerDep — externalize like Vue/Angular.
				// Consumers bundle svelte WITH browser conditions so Node gets
				// index-client.js (has mount()) instead of index-server.js.
				return true
			},
		},
	},
	plugins: [
		wolfie('svelte'),
		// WHY: No compilerOptions override needed. We use the default 'html' mode
		// which emits from_html() + template.innerHTML approach. WolfieDocument
		// provides a WolfieTemplateElement that parses the HTML to build a wrapper tree.
		svelte(),
		dts({ rollupTypes: false }),
	],
})
