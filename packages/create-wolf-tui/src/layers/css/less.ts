import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { TEMPLATE_FILES } from '../../paths'

export const lessLayer: ILayer = {
	id: 'css:less',
	templateVars: { cssImport: './styles/app.less' },
	packageJson: {
		devDependencies: { less: '^4.5.1' },
	},
	files: {
		'src/styles/app.less': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'app.less.ejs'),
		},
	},
}

export default lessLayer
