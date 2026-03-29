import path from 'path'
import { fileURLToPath } from 'url'
import { wolfie } from '@wolf-tui/plugin/webpack'
import { VueLoaderPlugin } from 'vue-loader'
import webpack from 'webpack'

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
		extensions: ['.ts', '.js', '.vue'],
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: { isServerBuild: false },
			},
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: {
					appendTsSuffixTo: [/\.vue$/],
					transpileOnly: true, // Disable type checking to avoid SSR slot type errors
				},
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								config: path.resolve(__dirname, 'postcss.config.cjs'),
							},
						},
					},
				],
			},
		],
	},
	plugins: [
		new VueLoaderPlugin(),
		wolfie('vue'),
		new webpack.DefinePlugin({
			__VUE_OPTIONS_API__: JSON.stringify(true),
			__VUE_PROD_DEVTOOLS__: JSON.stringify(false),
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
		}),
	],
	externals: [
		({ request }, callback) => {
			if (
				request?.startsWith('vue') ||
				request?.startsWith('@wolf-tui/') ||
				request?.startsWith('node:')
			) {
				return callback(null, `import ${request}`)
			}
			callback()
		},
	],
}
