import type { ILayer } from '../../types'

// Reference: examples/vue_esbuild/esbuild.config.js
export const vueEsbuildInteraction: ILayer = {
	id: 'interaction:vue-esbuild',
	packageJson: {
		devDependencies: {
			'unplugin-vue': '^6.2.0',
		},
		scripts: {
			start: 'node dist/index.js',
			dev: 'node build.js && node dist/index.js',
		},
	},
	templateVars: {
		outputFormat: 'esm',
		outputExt: 'js',
		needsCreateRequire: true,
	},
	configPatches: [
		{
			target: 'build.js',
			slot: 'importsSlot',
			content: "import Vue from 'unplugin-vue/esbuild'",
			mode: 'add',
		},
		{
			target: 'build.js',
			slot: 'pluginsSlot',
			content: 'Vue(),',
			mode: 'add',
		},
		{
			target: 'build.js',
			slot: 'extraSlot',
			content: `define: {
		__VUE_OPTIONS_API__: 'true',
		__VUE_PROD_DEVTOOLS__: 'false',
	},`,
			mode: 'add',
		},
	],
}
