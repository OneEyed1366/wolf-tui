import type { ILayer } from '../../types'

export const sassLayer: ILayer = {
	id: 'css:sass',
	packageJson: {
		devDependencies: { sass: '^1.97.3' },
	},
	files: {
		'src/styles/components.scss': {
			type: 'generated',
			content: `// Your SCSS styles here
// wolfie plugin compiles this automatically

.container {
	display: flex;
	flex-direction: column;
	padding: 1;
}
`,
		},
	},
}

export default sassLayer
