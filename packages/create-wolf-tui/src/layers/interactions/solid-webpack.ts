import type { ILayer } from '../../types'

// Reference: examples/solid_webpack/webpack.config.js
export const solidWebpackInteraction: ILayer = {
	id: 'interaction:solid-webpack',
	packageJson: {
		devDependencies: {
			'@babel/core': '^7.24.0',
			'@babel/preset-typescript': '^7.24.0',
			'babel-loader': '^9.1.3',
			'babel-preset-solid': '^1.9.0',
			'node-loader': '^2.0.0',
		},
	},
	configPatches: [
		{
			target: 'webpack.config.js',
			slot: 'rulesOverride',
			content: `{
				test: /\\.tsx?$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'babel-preset-solid',
								{
									generate: 'universal',
									moduleName: '@wolf-tui/solid/renderer',
								},
							],
							'@babel/preset-typescript',
						],
					},
				},
				exclude: /node_modules/,
			},
			{
				test: /\\.node$/,
				loader: 'node-loader',
				options: {
					name: 'native/[name].[ext]',
				},
			},`,
			mode: 'override',
		},
		{
			target: 'webpack.config.js',
			slot: 'resolveSlot',
			content:
				"conditionNames: ['browser', 'development', 'node', 'import', 'require'],",
			mode: 'add',
		},
	],
}
