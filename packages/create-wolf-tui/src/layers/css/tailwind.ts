import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { TEMPLATE_FILES } from '../../paths'

export const tailwindLayer: ILayer = {
	id: 'css:tailwind',
	templateVars: {
		tailwindImport: './styles/tailwind.css',
		cssFlavor: 'tailwind',
		/**
		 * Tailwind utility class mappings for wolf-tui terminal properties.
		 * Uses arbitrary value syntax [property:value] for terminal-specific styles
		 * and [color] for ANSI named colors (Tailwind doesn't ship them by default).
		 *
		 * Examples in templates:
		 *   <Box className="<%= vars.tw.outerBorder %> <%= vars.tw.borderBrand %> px-2">
		 *   <Text className="font-bold <%= vars.tw.colorBrand %>">title</Text>
		 *   <Text className={count > 0 ? '<%= vars.tw.colorPositive %>' : '<%= vars.tw.colorNegative %>'}>
		 */
		tw: {
			outerBorder: '[border-style:round]',
			innerBorder: '[border-style:single]',
			colorBrand: 'text-[cyan]',
			borderBrand: 'border-[cyan]',
			colorPositive: 'text-[green]',
			colorNegative: 'text-[red]',
			colorNeutral: 'text-[white]',
			colorMuted: 'text-[gray]',
			borderPositive: 'border-[green]',
			borderNegative: 'border-[red]',
			borderNeutral: 'border-[white]',
		},
	},
	configPatches: [
		{
			target: 'vite.config.ts',
			slot: 'extraConfigSlot',
			content: "css: { postcss: resolve(__dirname, 'postcss.config.cjs') },",
			mode: 'add',
		},
		{
			target: 'webpack.config.js',
			slot: 'rulesSlot',
			content: `{
				test: /\\.css$/,
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
			},`,
			mode: 'add',
		},
	],
	packageJson: {
		devDependencies: {
			'@tailwindcss/postcss': '^4.1.18',
			postcss: '^8.5.6',
			tailwindcss: '~4.1.18',
			autoprefixer: '^10.4.23',
			'postcss-loader': '^8.1.1',
		},
	},
	files: {
		'postcss.config.cjs': {
			type: 'static',
			source: resolve(TEMPLATE_FILES, 'postcss.config.cjs'),
		},
		'src/styles/tailwind.css': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'app.tailwind.css.ejs'),
		},
	},
}

export default tailwindLayer
