import { resolve } from 'node:path'
import type { ILayer } from '../../types'
import { VERSIONS } from '../../versions.gen'
import { TEMPLATE_FILES } from '../../paths'

export const angularLayer: ILayer = {
	id: 'framework:angular',
	packageJson: {
		dependencies: {
			'@wolf-tui/angular': VERSIONS['@wolf-tui/angular'] ?? '^1.3.0',
			'@angular/compiler': '^19.0.0',
			'zone.js': '~0.15.0',
		},
		devDependencies: {
			'@angular/common': '^19.0.0',
			'@angular/core': '^19.0.0',
			rxjs: '^7.8.0',
		},
	},
	externals: [
		'@angular/core',
		'@angular/common',
		'@angular/compiler',
		'zone.js',
		'rxjs',
		'@wolf-tui/angular',
	],
	templateVars: {
		entryExt: 'ts',
		entryFile: 'main.ts',
		brandColor: '#DD0031',
		brandName: 'Angular',
	},
	tsconfig: {
		compilerOptions: {
			experimentalDecorators: true,
			emitDecoratorMetadata: true,
		},
	},
	files: {
		'src/main.ts': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'entry-angular.ts.ejs'),
		},
		'src/app.component.ts': {
			type: 'template',
			source: resolve(TEMPLATE_FILES, 'app-angular.ts.ejs'),
		},
	},
}

export default angularLayer
