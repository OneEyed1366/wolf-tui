import { describe, it, expect } from 'vitest'
import { isSupported, getBundlerOptions } from '../src/matrix'

describe('matrix', () => {
	it('allows react + vite', () => {
		expect(isSupported('react', 'vite')).toBe(true)
	})

	it('allows react + webpack', () => {
		expect(isSupported('react', 'webpack')).toBe(true)
	})

	it('allows react + esbuild', () => {
		expect(isSupported('react', 'esbuild')).toBe(true)
	})

	it('allows solid + vite', () => {
		expect(isSupported('solid', 'vite')).toBe(true)
	})

	it('allows all bundler options for solid', () => {
		const options = getBundlerOptions('solid')
		const viteOpt = options.find((o) => o.value === 'vite')
		expect(viteOpt?.disabled).toBeFalsy()
		expect(options.find((o) => o.value === 'webpack')?.disabled).toBeFalsy()
		expect(options.find((o) => o.value === 'esbuild')?.disabled).toBeFalsy()
	})

	it('shows rollup as disabled hint for all frameworks', () => {
		const options = getBundlerOptions('react')
		const rollup = options.find((o) => o.value === 'rollup')
		expect(rollup).toBeDefined()
		expect(rollup?.hint).toContain('coming soon')
		expect(rollup?.disabled).toBe(true)
	})

	it('allows all 15 supported combos', () => {
		const combos = [
			['react', 'vite'],
			['react', 'webpack'],
			['react', 'esbuild'],
			['vue', 'vite'],
			['vue', 'webpack'],
			['vue', 'esbuild'],
			['angular', 'vite'],
			['angular', 'webpack'],
			['angular', 'esbuild'],
			['solid', 'vite'],
			['solid', 'webpack'],
			['solid', 'esbuild'],
			['svelte', 'vite'],
			['svelte', 'webpack'],
			['svelte', 'esbuild'],
		] as const
		for (const [fw, bun] of combos) {
			expect(isSupported(fw, bun), `${fw}+${bun} should be supported`).toBe(
				true
			)
		}
	})
})
