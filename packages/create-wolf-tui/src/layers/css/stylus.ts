import type { ILayer } from '../../types'

export const stylusLayer: ILayer = {
	id: 'css:stylus',
	packageJson: {
		devDependencies: { stylus: '^0.64.0' },
	},
	files: {
		'src/styles/styles.styl': {
			type: 'generated',
			content: `// Your Stylus styles here
// wolfie plugin compiles this automatically

.container
	display flex
	flex-direction column
	padding 1
`,
		},
	},
}

export default stylusLayer
