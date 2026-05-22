import type { ILayer } from '../types'
import { VERSIONS } from '../versions.gen'

export function testLayer(bundler: 'vite' | 'webpack' | 'esbuild'): ILayer {
	const isVite = bundler === 'vite'

	const layer: ILayer = {
		id: 'test',
		packageJson: {
			devDependencies: {
				vitest: '^3.0.0',
				chalk: '^5.0.0',
				'@wolf-tui/testing-library':
					VERSIONS['@wolf-tui/testing-library'] ?? '^1.0.0',
			},
			scripts: {
				test: 'vitest run',
			},
		},
		files: {
			'test/setup.ts': {
				type: 'generated',
				content: [
					"import chalk from 'chalk'",
					'',
					"process.env.WOLFIE_VERIFY = '1'",
					"process.env.FORCE_COLOR = '3'",
					'',
					'// Force full color support so that ANSI escapes are generated',
					'// even in headless non-TTY testing environments.',
					'chalk.level = 3',
					'',
				].join('\n'),
			},
		},
	}

	if (isVite) {
		layer.configPatches = [
			{
				target: 'vite.config.ts',
				slot: 'extraConfigSlot',
				mode: 'add',
				content: `	test: {
		setupFiles: ['./test/setup.ts'],
	},`,
			},
		]
	} else {
		// If not Vite, we need a separate vitest.config.ts
		if (layer.files) {
			layer.files['vitest.config.ts'] = {
				type: 'generated',
				content: [
					"import { defineConfig } from 'vitest/config'",
					'',
					'export default defineConfig({',
					'\ttest: {',
					"\t\tsetupFiles: ['./test/setup.ts'],",
					'\t},',
					'})',
					'',
				].join('\n'),
			}
		}
	}

	return layer
}
