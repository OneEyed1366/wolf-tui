import { describe, it, expect } from 'vitest'
import { mergePackageJson, mergeTsconfig, resolveSlots } from '../src/composer'
import type { ILayer, IConfigPatch } from '../src/types'

describe('mergePackageJson', () => {
	it('merges dependencies from multiple layers', () => {
		const layers: ILayer[] = [
			{
				id: 'a',
				packageJson: { dependencies: { react: '^19.0.0' } },
			},
			{
				id: 'b',
				packageJson: {
					dependencies: { vue: '^3.5.0' },
					devDependencies: { vite: '^6.0.0' },
				},
			},
		]
		const result = mergePackageJson(layers)
		expect(result.dependencies).toEqual({
			react: '^19.0.0',
			vue: '^3.5.0',
		})
		expect(result.devDependencies).toEqual({ vite: '^6.0.0' })
	})

	it('later layer wins on conflict', () => {
		const layers: ILayer[] = [
			{
				id: 'a',
				packageJson: { dependencies: { react: '^18.0.0' } },
			},
			{
				id: 'b',
				packageJson: { dependencies: { react: '^19.0.0' } },
			},
		]
		const result = mergePackageJson(layers)
		expect(result.dependencies?.['react']).toBe('^19.0.0')
	})
})

describe('mergeTsconfig', () => {
	it('deep merges compilerOptions', () => {
		const layers: ILayer[] = [
			{
				id: 'a',
				tsconfig: {
					compilerOptions: { strict: true, target: 'ES2022' },
				},
			},
			{
				id: 'b',
				tsconfig: { compilerOptions: { jsx: 'react-jsx' } },
			},
		]
		const result = mergeTsconfig(layers)
		expect(result.compilerOptions).toEqual({
			strict: true,
			target: 'ES2022',
			jsx: 'react-jsx',
		})
	})

	it('unions include arrays', () => {
		const layers: ILayer[] = [
			{ id: 'a', tsconfig: { include: ['src'] } },
			{ id: 'b', tsconfig: { include: ['src', 'types'] } },
		]
		const result = mergeTsconfig(layers)
		expect(result.include).toEqual(['src', 'types'])
	})
})

describe('resolveSlots', () => {
	it('concatenates add-mode patches sorted by priority', () => {
		const patches: IConfigPatch[] = [
			{
				target: 'vite.config.ts',
				slot: 'pluginsSlot',
				content: 'vue()',
				mode: 'add',
				priority: 20,
			},
			{
				target: 'vite.config.ts',
				slot: 'pluginsSlot',
				content: 'wolfie()',
				mode: 'add',
				priority: 10,
			},
		]
		const slots = resolveSlots(patches)
		const pluginSlot = slots.get('vite.config.ts')?.get('pluginsSlot')
		expect(pluginSlot).toContain('wolfie()')
		expect(pluginSlot!.indexOf('wolfie()')).toBeLessThan(
			pluginSlot!.indexOf('vue()')
		)
	})

	it('override wins over add', () => {
		const patches: IConfigPatch[] = [
			{
				target: 'w.config.js',
				slot: 'rulesSlot',
				content: 'ts-loader',
				mode: 'add',
			},
			{
				target: 'w.config.js',
				slot: 'rulesOverride',
				content: 'babel-loader',
				mode: 'override',
			},
		]
		const slots = resolveSlots(patches)
		expect(slots.get('w.config.js')?.get('rulesOverride')).toBe('babel-loader')
	})

	it('last override wins when multiple overrides', () => {
		const patches: IConfigPatch[] = [
			{
				target: 'x.js',
				slot: 'rulesOverride',
				content: 'first',
				mode: 'override',
			},
			{
				target: 'x.js',
				slot: 'rulesOverride',
				content: 'second',
				mode: 'override',
			},
		]
		const slots = resolveSlots(patches)
		expect(slots.get('x.js')?.get('rulesOverride')).toBe('second')
	})
})
