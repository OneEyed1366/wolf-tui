import type { ILayer } from '../../types'

export const lessLayer: ILayer = {
	id: 'css:less',
	packageJson: {
		devDependencies: { less: '^4.5.1' },
	},
	files: {
		'src/styles/styles.less': {
			type: 'generated',
			content: `// Your Less styles here
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

export default lessLayer
