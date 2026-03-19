import path from 'path'
import { fileURLToPath } from 'url'
import { wolfie } from '@wolfie/plugin/webpack'
import { sveltePreprocess } from 'svelte-preprocess'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
	mode: 'production',
	target: 'node',
	entry: './src/index.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js',
		module: true,
		library: { type: 'module' },
	},
	experiments: {
		outputModule: true,
	},
	optimization: {
		minimize: false,
		usedExports: true,
	},
	resolve: {
		extensions: ['.svelte', '.ts', '.js'],
		// WHY: 'svelte' condition resolves svelte to its browser export (mount/signals),
		// 'browser' ensures client-side internals. Without these, Node resolves to index-server.js.
		conditionNames: ['svelte', 'browser', 'import', 'module', 'default'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
	},
	module: {
		rules: [
			// WHY: Svelte 5 .svelte.ts rune modules need svelte-loader THEN ts-loader (chained).
			// svelte-loader compiles $state/$derived runes; ts-loader strips TS types.
			{
				test: /\.svelte\.ts$/,
				use: [
					'svelte-loader',
					{ loader: 'ts-loader', options: { transpileOnly: true } },
				],
			},
			// WHY: Regular .ts files (NOT .svelte.ts) → ts-loader only.
			// Negative lookbehind prevents double-processing .svelte.ts files.
			{
				test: /(?<!\.svelte)\.ts$/,
				loader: 'ts-loader',
				options: { transpileOnly: true },
				exclude: /node_modules/,
			},
			// WHY: .svelte components → svelte-loader with generate: 'client' to produce
			// DOM-mode code (signals + reactivity). Without this, SSR-mode generates plain vars.
			{
				test: /\.(svelte|svelte\.js)$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: { generate: 'client', css: 'external' },
						preprocess: sveltePreprocess(),
					},
				},
			},
			// WHY: Svelte's node_modules .mjs files use extensionless imports.
			// fullySpecified: false lets webpack resolve them without explicit extensions.
			{
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: { fullySpecified: false },
			},
		],
	},
	plugins: [wolfie('svelte')],
	// WHY: Externalize ALL bare specifiers (svelte, @wolfie/*, etc.) so both
	// the app and adapter share ONE svelte runtime from node_modules.
	// Local files (./...) are bundled normally.
	externals: [
		({ request }, callback) => {
			if (request && !request.startsWith('.') && !request.startsWith('/')) {
				return callback(null, `import ${request}`)
			}
			callback()
		},
	],
	externalsType: 'module',
}
