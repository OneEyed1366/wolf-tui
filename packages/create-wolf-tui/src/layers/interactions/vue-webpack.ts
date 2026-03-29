import type { ILayer } from '../../types'

// Reference: examples/vue_webpack/webpack.config.js
export const vueWebpackInteraction: ILayer = {
	id: 'interaction:vue-webpack',
	templateVars: {
		webpackModule: true,
		outputExt: 'js',
	},
	packageJson: {
		devDependencies: {
			'vue-loader': '^17.4.2',
			'vue-template-compiler': '^2.7.16',
		},
		scripts: {
			start: 'node dist/index.js',
			dev: 'webpack && node dist/index.js',
		},
	},
	configPatches: [
		{
			target: 'webpack.config.js',
			slot: 'importsSlot',
			content: `import { VueLoaderPlugin } from 'vue-loader'
import webpack from 'webpack'`,
			mode: 'add',
		},
		{
			target: 'webpack.config.js',
			slot: 'rulesOverride',
			content: `{
				test: /\\.vue$/,
				loader: 'vue-loader',
				options: { isServerBuild: false },
			},
			{
				test: /\\.tsx?$/,
				use: [{
					loader: 'ts-loader',
					options: {
						transpileOnly: true,
						appendTsSuffixTo: [/\\.vue$/],
					},
				}],
				exclude: /node_modules/,
			},`,
			mode: 'override',
		},
		{
			target: 'webpack.config.js',
			slot: 'pluginsSlot',
			content: `new VueLoaderPlugin(),
		new webpack.DefinePlugin({
			__VUE_OPTIONS_API__: JSON.stringify(true),
			__VUE_PROD_DEVTOOLS__: JSON.stringify(false),
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
		}),`,
			mode: 'add',
		},
		{
			target: 'webpack.config.js',
			slot: 'externalsOverride',
			content: `externals: [
		({ request }, callback) => {
			if (
				request?.startsWith('vue') ||
				request?.startsWith('@wolf-tui/') ||
				request?.startsWith('node:')
			) {
				return callback(null, \`import \${request}\`)
			}
			callback()
		},
	],`,
			mode: 'override',
		},
	],
}
