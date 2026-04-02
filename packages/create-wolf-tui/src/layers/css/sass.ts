import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { TEMPLATE_FILES } from '../../paths'

export const sassLayer: ILayer = {
	id: 'css:sass',
	templateVars: { cssImport: './styles/app.scss' },
	packageJson: {
		devDependencies: { sass: '^1.97.3' },
	},
	files: {
		'src/styles/app.scss': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'app.scss.ejs'),
		},
	},
}

export default sassLayer
