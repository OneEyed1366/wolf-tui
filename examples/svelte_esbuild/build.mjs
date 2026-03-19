import * as esbuild from 'esbuild'
import { wolfie } from '@wolfie/plugin/esbuild'
import sveltePlugin from 'esbuild-svelte'
import { sveltePreprocess } from 'svelte-preprocess'

await esbuild.build({
	entryPoints: ['src/index.ts'],
	bundle: true,
	outfile: 'dist/index.js',
	format: 'esm',
	platform: 'node',
	target: 'node20',
	// WHY: externalizes ALL bare specifiers (svelte, @wolfie/svelte, etc.)
	// so both the app and the adapter share ONE svelte runtime from node_modules.
	packages: 'external',
	conditions: ['svelte', 'browser'],
	mainFields: ['svelte', 'browser', 'module', 'main'],
	plugins: [
		sveltePlugin({
			compilerOptions: { generate: 'client', css: 'external' },
			preprocess: sveltePreprocess(),
		}),
		wolfie('svelte'),
	],
	banner: {
		js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
	},
	logLevel: 'info',
})

console.log('Build complete: dist/index.js')
