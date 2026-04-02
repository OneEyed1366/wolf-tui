import type { ILayer } from '../../types'

// Reference: examples/angular_vite/vite.config.ts
export const angularViteInteraction: ILayer = {
	id: 'interaction:angular-vite',
	packageJson: {
		scripts: {
			start: 'node dist/index.cjs',
			dev: 'vite build && node dist/index.cjs',
		},
	},
	configPatches: [
		{
			target: 'vite.config.ts',
			slot: 'buildOverride',
			content: `build: {
		target: 'node20',
		ssr: resolve(__dirname, 'src/main.ts'),
		rollupOptions: {
			output: {
				format: 'cjs',
				entryFileNames: 'index.cjs',
			},
			external: [
				'@angular/core',
				'@angular/common',
				'@wolf-tui/angular',
				'zone.js',
				'@angular/compiler',
			],
		},
	},`,
			mode: 'override',
		},
	],
}
