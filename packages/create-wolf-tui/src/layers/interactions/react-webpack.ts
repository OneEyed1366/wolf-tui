import type { ILayer } from '../../types'

// Reference: examples/react_webpack/webpack.config.js
// React + webpack just needs node-loader for .node native bindings.
// Base webpack rules (ts-loader) suffice. wolfie plugin handles CSS.
export const reactWebpackInteraction: ILayer = {
	id: 'interaction:react-webpack',
	packageJson: {
		devDependencies: {
			'node-loader': '^2.0.0',
		},
	},
	configPatches: [
		{
			target: 'webpack.config.js',
			slot: 'rulesSlot',
			content: `{
				test: /\\.node$/,
				loader: 'node-loader',
				options: {
					name: 'native/[name].[ext]',
				},
			},`,
			mode: 'add',
		},
	],
}
