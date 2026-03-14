/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { wolfie } from '@wolfie/plugin/vite'

export default defineConfig({
	plugins: [
		wolfie('react', {
			mode: 'module',
			include: /\.module\.css$/,
		}),
		react(),
	],
	test: {
		globals: true,
		environment: 'node',
		testTimeout: 30000,
		include: ['test/**/*.{ts,tsx}'],
		exclude: ['test/helpers/**', 'test/fixtures/**', 'test/setup.ts'],
		setupFiles: ['./test/setup.ts'],
		pool: 'forks',
		poolOptions: {
			forks: { singleFork: true },
		},
	},
})
