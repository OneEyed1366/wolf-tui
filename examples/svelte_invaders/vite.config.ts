import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { wolfie } from '@wolfie/plugin/vite'
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
	plugins: [
		svelte({
			compilerOptions: { css: 'external' },
			// vite-node runs in SSR mode → Svelte compiles with generate:'server'
			// → $state in .svelte.ts modules loses reactivity (no signals, plain vars).
			// Force client compilation so cross-module $state works reactively.
			dynamicCompileOptions() {
				return { generate: 'client' }
			},
		}),
		wolfie('svelte'),
	],
	css: { postcss: resolve(__dirname, 'postcss.config.cjs') },
	resolve: { conditions: ['browser', 'development'] },
	// Prevent vite from pre-bundling svelte — avoids dual-runtime where
	// pre-bundled active_effect diverges from SSR-transformed module state.
	optimizeDeps: {
		exclude: ['svelte', '@wolfie/svelte'],
	},
	// vite-node runs in SSR mode — needs separate resolve config for SSR.
	// Without this, svelte resolves to index-server.js ("mount() not available").
	ssr: {
		resolve: {
			conditions: ['browser', 'development', 'import', 'module'],
		},
		noExternal: ['@wolfie/svelte', 'svelte'],
	},
	build: {
		target: 'node18',
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			preserveEntrySignatures: 'exports-only',
			// Externalize both @wolfie/svelte AND svelte.
			// All three (adapter, app, svelte) share ONE svelte runtime from node_modules.
			// Consumers must use --conditions=browser (verify.cjs self-respawns, e2e uses execArgv).
			external: (id) =>
				id === '@wolfie/svelte' ||
				id.startsWith('@wolfie/svelte/') ||
				id === 'svelte' ||
				id.startsWith('svelte/') ||
				nodeBuiltins.includes(id),
		},
	},
})
