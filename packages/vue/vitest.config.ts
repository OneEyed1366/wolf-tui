import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// Custom elements used by Wolfie's renderer
const isCustomElement = (tag: string) => tag.startsWith('wolfie-')

export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: { isCustomElement },
			},
		}),
		vueJsx({ isCustomElement }),
	],
	test: {
		include: ['test/**/*.test.{ts,tsx}'],
		globals: false,
		testTimeout: 30000,
		setupFiles: ['./test/setup.ts'],
		server: {
			deps: {
				inline: [/@wolfie/],
			},
		},
	},
	// Explicitly disable SSR mode
	ssr: {
		noExternal: true,
	},
	define: {
		// Ensure we're in client mode
		'import.meta.env.SSR': false,
	},
})
