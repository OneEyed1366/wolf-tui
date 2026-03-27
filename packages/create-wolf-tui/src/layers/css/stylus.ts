import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { TEMPLATE_FILES } from '../../paths'

export const stylusLayer: ILayer = {
	id: 'css:stylus',
	templateVars: { cssImport: './styles/app.styl' },
	packageJson: {
		devDependencies: { stylus: '^0.64.0' },
	},
	files: {
		'src/styles/app.styl': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'app.styl.ejs'),
		},
	},
}

export default stylusLayer
