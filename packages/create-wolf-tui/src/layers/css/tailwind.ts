import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { TEMPLATE_FILES } from '../../paths'

export const tailwindLayer: ILayer = {
	id: 'css:tailwind',
	templateVars: { cssImport: './styles/tailwind.css', cssFlavor: 'tailwind' },
	packageJson: {
		devDependencies: {
			'@tailwindcss/postcss': '^4.1.18',
			postcss: '^8.5.6',
			tailwindcss: '~4.1.18',
			autoprefixer: '^10.4.23',
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
