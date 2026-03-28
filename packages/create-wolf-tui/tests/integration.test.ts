import { describe, it, expect } from 'vitest'
import { compose } from '../src/composer'
import { parseFlags } from '../src/cli'
import type { IProjectConfig } from '../src/types'

function makeConfig(overrides: Partial<IProjectConfig>): IProjectConfig {
	return {
		name: 'test-app',
		framework: 'react',
		bundler: 'vite',
		tailwind: false,
		lint: false,
		git: false,
		install: false,
		targetDir: '/tmp/wolf-test',
		...overrides,
	}
}

describe('compose integration', () => {
	it('composes react + vite', async () => {
		const result = await compose(makeConfig({}))
		const pkg = result.packageJson as Record<string, Record<string, string>>

		expect(pkg['dependencies']).toHaveProperty('react')
		expect(pkg['dependencies']).toHaveProperty('@wolf-tui/react')
		expect(pkg['devDependencies']).toHaveProperty('vite')
		expect(pkg['devDependencies']).toHaveProperty('typescript')
		expect(pkg['devDependencies']).toHaveProperty('@wolf-tui/plugin')
		expect(result.files.has('vite.config.ts')).toBe(true)
		expect(result.files.has('.gitignore')).toBe(true)
		expect(result.files.has('env.d.ts')).toBe(true)
		expect(result.files.has('src/index.tsx')).toBe(true)
		expect(result.files.has('src/App.tsx')).toBe(true)
	})

	it('composes vue + webpack', async () => {
		const result = await compose(
			makeConfig({ framework: 'vue', bundler: 'webpack' })
		)
		const pkg = result.packageJson as Record<string, Record<string, string>>

		expect(pkg['dependencies']).toHaveProperty('vue')
		expect(pkg['dependencies']).toHaveProperty('@wolf-tui/vue')
		expect(pkg['devDependencies']).toHaveProperty('webpack')
		expect(pkg['devDependencies']).toHaveProperty('vue-loader')
		expect(result.files.has('webpack.config.js')).toBe(true)
		expect(result.files.has('src/index.ts')).toBe(true)
		expect(result.files.has('src/App.vue')).toBe(true)

		// webpack config should contain VueLoaderPlugin
		const wpConfig = result.files.get('webpack.config.js')!
		expect(wpConfig).toContain('VueLoaderPlugin')
		expect(wpConfig).toContain("wolfie('vue')")
	})

	it('composes angular + vite (SSR mode)', async () => {
		const result = await compose(
			makeConfig({ framework: 'angular', bundler: 'vite' })
		)
		const viteConfig = result.files.get('vite.config.ts')!

		// Angular-vite uses SSR build instead of lib
		expect(viteConfig).toContain('ssr')
		expect(viteConfig).toContain("wolfie('angular')")
	})

	it('composes solid + esbuild', async () => {
		const result = await compose(
			makeConfig({ framework: 'solid', bundler: 'esbuild' })
		)
		const buildJs = result.files.get('build.js')!

		expect(buildJs).toContain('solidPlugin')
		expect(buildJs).toContain("wolfie('solid')")
	})

	it('composes svelte + webpack (ESM output)', async () => {
		const result = await compose(
			makeConfig({ framework: 'svelte', bundler: 'webpack' })
		)
		const wpConfig = result.files.get('webpack.config.js')!

		expect(wpConfig).toContain('svelte-loader')
		expect(wpConfig).toContain("generate: 'client'")
		expect(wpConfig).toContain('module: true')
	})

	it('rejects solid + vite', () => {
		expect(() =>
			compose(makeConfig({ framework: 'solid', bundler: 'vite' }))
		).toThrow('Solid')
	})

	it('adds sass devDep when cssPreprocessor is sass', async () => {
		const result = await compose(makeConfig({ cssPreprocessor: 'sass' }))
		const pkg = result.packageJson as Record<string, Record<string, string>>

		expect(pkg['devDependencies']).toHaveProperty('sass')
		expect(result.files.has('src/styles/app.scss')).toBe(true)
	})

	it('adds tailwind deps and postcss config', async () => {
		const result = await compose(makeConfig({ tailwind: true }))
		const pkg = result.packageJson as Record<string, Record<string, string>>

		expect(pkg['devDependencies']).toHaveProperty('tailwindcss')
		expect(pkg['devDependencies']).toHaveProperty('@tailwindcss/postcss')
		expect(result.files.has('postcss.config.cjs')).toBe(true)
		expect(result.files.has('src/styles/tailwind.css')).toBe(true)
	})

	it('tailwind + sass coexist without cssImport conflict', async () => {
		const result = await compose(
			makeConfig({ tailwind: true, cssPreprocessor: 'sass' })
		)
		const pkg = result.packageJson as Record<string, Record<string, string>>

		// Both deps present
		expect(pkg['devDependencies']).toHaveProperty('tailwindcss')
		expect(pkg['devDependencies']).toHaveProperty('sass')

		// Both files present
		expect(result.files.has('src/styles/tailwind.css')).toBe(true)
		expect(result.files.has('src/styles/app.scss')).toBe(true)
		expect(result.files.has('postcss.config.cjs')).toBe(true)

		// Entry imports both
		const entry = result.files.get('src/index.tsx')!
		expect(entry).toContain('./styles/tailwind.css')
		expect(entry).toContain('./styles/app.scss')
	})

	it('no CSS selected → inline styles template', async () => {
		const result = await compose(makeConfig({}))
		const app = result.files.get('src/App.tsx')!

		// Should use inline style objects, not className
		expect(app).toContain('style={{')
		expect(app).toContain("borderStyle: 'round'")
	})

	it('adds eslint when lint is true', async () => {
		const result = await compose(makeConfig({ lint: true }))
		const pkg = result.packageJson as Record<string, Record<string, string>>

		expect(pkg['devDependencies']).toHaveProperty('eslint')
		expect(pkg['devDependencies']).toHaveProperty('eslint-plugin-react')
		expect(result.files.has('eslint.config.js')).toBe(true)
		expect(result.files.has('.prettierrc.json')).toBe(true)
	})

	it('composes all 14 supported combos without errors', async () => {
		const combos = [
			{ framework: 'react', bundler: 'vite' },
			{ framework: 'react', bundler: 'webpack' },
			{ framework: 'react', bundler: 'esbuild' },
			{ framework: 'vue', bundler: 'vite' },
			{ framework: 'vue', bundler: 'webpack' },
			{ framework: 'vue', bundler: 'esbuild' },
			{ framework: 'angular', bundler: 'vite' },
			{ framework: 'angular', bundler: 'webpack' },
			{ framework: 'angular', bundler: 'esbuild' },
			{ framework: 'solid', bundler: 'webpack' },
			{ framework: 'solid', bundler: 'esbuild' },
			{ framework: 'svelte', bundler: 'vite' },
			{ framework: 'svelte', bundler: 'webpack' },
			{ framework: 'svelte', bundler: 'esbuild' },
		] as const

		for (const { framework, bundler } of combos) {
			const result = await compose(makeConfig({ framework, bundler }))
			expect(
				result.files.size,
				`${framework}+${bundler} should have files`
			).toBeGreaterThan(0)
			expect(
				result.packageJson,
				`${framework}+${bundler} should have packageJson`
			).toBeDefined()
		}
	})

	it('svelte+webpack start script uses --conditions=browser and .js', () => {
		const result = compose(
			makeConfig({ framework: 'svelte', bundler: 'webpack' })
		)
		const scripts = (
			result.packageJson as Record<string, Record<string, string>>
		)['scripts']
		expect(scripts['start']).toContain('--conditions=browser')
		expect(scripts['start']).toContain('dist/index.js')
		expect(scripts['dev']).toContain('--conditions=browser')
	})

	it('svelte+esbuild start script uses --conditions=browser and .js', () => {
		const result = compose(
			makeConfig({ framework: 'svelte', bundler: 'esbuild' })
		)
		const scripts = (
			result.packageJson as Record<string, Record<string, string>>
		)['scripts']
		expect(scripts['start']).toContain('--conditions=browser')
		expect(scripts['start']).toContain('dist/index.js')
	})

	it('svelte+vite start script uses --conditions=browser', () => {
		const result = compose(makeConfig({ framework: 'svelte', bundler: 'vite' }))
		const scripts = (
			result.packageJson as Record<string, Record<string, string>>
		)['scripts']
		expect(scripts['start']).toContain('--conditions=browser')
	})

	it('vue+vite start script uses .cjs', () => {
		const result = compose(makeConfig({ framework: 'vue', bundler: 'vite' }))
		const scripts = (
			result.packageJson as Record<string, Record<string, string>>
		)['scripts']
		expect(scripts['start']).toContain('dist/index.cjs')
	})

	it('angular+vite start script uses .cjs', () => {
		const result = compose(
			makeConfig({ framework: 'angular', bundler: 'vite' })
		)
		const scripts = (
			result.packageJson as Record<string, Record<string, string>>
		)['scripts']
		expect(scripts['start']).toContain('dist/index.cjs')
	})

	it('vue+esbuild start script uses .js (ESM)', () => {
		const result = compose(makeConfig({ framework: 'vue', bundler: 'esbuild' }))
		const scripts = (
			result.packageJson as Record<string, Record<string, string>>
		)['scripts']
		expect(scripts['start']).toContain('dist/index.js')
		expect(scripts['start']).not.toContain('.cjs')
	})
})

describe('parseFlags — CSS handling', () => {
	it('--css tailwind → tailwind in parts', () => {
		const flags = parseFlags(['--css', 'tailwind'])
		expect(flags.css).toBe('tailwind')
	})

	it('--css sass → sass in parts, no tailwind', () => {
		const flags = parseFlags(['--css', 'sass'])
		expect(flags.css).toBe('sass')
		expect(flags.css!.includes('tailwind')).toBe(false)
	})

	it('--css tailwind,sass → both', () => {
		const flags = parseFlags(['--css', 'tailwind,sass'])
		expect(flags.css!.includes('tailwind')).toBe(true)
		expect(flags.css!.includes('sass')).toBe(true)
	})

	it('no --css → css is undefined', () => {
		const flags = parseFlags(['--framework', 'react'])
		expect(flags.css).toBeUndefined()
	})
})
