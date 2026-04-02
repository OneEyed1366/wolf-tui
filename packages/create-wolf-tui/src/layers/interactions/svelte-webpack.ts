import type { ILayer } from '../../types'

// Reference: examples/svelte_webpack/webpack.config.js
export const svelteWebpackInteraction: ILayer = {
	id: 'interaction:svelte-webpack',
	packageJson: {
		devDependencies: {
			'svelte-loader': '^3.2.4',
			'svelte-preprocess': '^6.0.0',
		},
		scripts: {
			start: 'node --conditions=browser dist/index.js',
			dev: 'webpack && node --conditions=browser dist/index.js',
		},
	},
	templateVars: {
		outputFormat: 'esm',
		outputExt: 'js',
		webpackModule: true,
	},
	configPatches: [
		{
			target: 'webpack.config.js',
			slot: 'importsSlot',
			content: "import { sveltePreprocess } from 'svelte-preprocess'",
			mode: 'add',
		},
		{
			target: 'webpack.config.js',
			slot: 'rulesOverride',
			content: `{
				test: /\\.svelte\\.ts$/,
				use: [
					'svelte-loader',
					{ loader: 'ts-loader', options: { transpileOnly: true } },
				],
			},
			{
				test: /(?<!\\.svelte)\\.ts$/,
				loader: 'ts-loader',
				options: { transpileOnly: true },
				exclude: /node_modules/,
			},
			{
				test: /\\.(svelte|svelte\\.js)$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: { generate: 'client', css: 'external' },
						preprocess: sveltePreprocess(),
					},
				},
			},
			{
				test: /node_modules\\/svelte\\/.*\\.mjs$/,
				resolve: { fullySpecified: false },
			},`,
			mode: 'override',
		},
		{
			target: 'webpack.config.js',
			slot: 'resolveSlot',
			content: `extensions: ['.svelte', '.ts', '.js'],
		conditionNames: ['svelte', 'browser', 'import', 'module', 'default'],
		mainFields: ['svelte', 'browser', 'module', 'main'],`,
			mode: 'add',
		},
		{
			target: 'webpack.config.js',
			slot: 'externalsOverride',
			content: `externals: [
		({ request }, callback) => {
			if (request && !request.startsWith('.') && !request.startsWith('/')) {
				return callback(null, \`import \${request}\`)
			}
			callback()
		},
	],
	externalsType: 'module',`,
			mode: 'override',
		},
	],
}
