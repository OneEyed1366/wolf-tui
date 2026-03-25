import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import solidPlugin from 'vite-plugin-solid'
import { wolfie } from '@wolf-tui/plugin/vite'

export default defineConfig({
	resolve: {
		// Map @wolf-tui/solid/renderer to source so JSX transform uses local renderer
		alias: {
			'@wolf-tui/solid/renderer': resolve(__dirname, 'src/renderer/index.ts'),
		},
		// Force browser build of solid-js (Node resolves to server build otherwise)
		conditions: ['browser', 'development'],
	},
	plugins: [
		wolfie('solid', { include: /\.module\.css$/ }),
		solidPlugin({
			solid: {
				moduleName: '@wolf-tui/solid/renderer',
				generate: 'universal',
			},
		}),
	],
	test: {
		globals: true,
		environment: 'node',
		include: ['test/**/*.{ts,tsx}'],
		exclude: ['test/helpers/**'],
		server: {
			deps: {
				// Inline @wolf-tui workspace packages so Vite transforms their source
				inline: [/@wolf-tui/],
			},
		},
		pool: 'forks',
		poolOptions: {
			forks: { singleFork: true },
		},
	},
})
