import type { Framework, Bundler } from './types'

//#region Supported Matrix

const SUPPORTED: Record<Framework, Bundler[]> = {
	react: ['vite', 'webpack', 'esbuild'],
	vue: ['vite', 'webpack', 'esbuild'],
	angular: ['vite', 'webpack', 'esbuild'],
	solid: ['webpack', 'esbuild'],
	svelte: ['vite', 'webpack', 'esbuild'],
}

export function isSupported(framework: Framework, bundler: Bundler): boolean {
	return SUPPORTED[framework]?.includes(bundler) ?? false
}

export function getBlockedMessage(
	framework: Framework,
	bundler: Bundler
): string {
	if (framework === 'solid' && bundler === 'vite') {
		return 'Solid + Vite is not yet supported. Use Webpack or esbuild.'
	}
	return `${framework} + ${bundler} is not supported.`
}

//#endregion Supported Matrix

//#region Bundler Options for Prompts

interface IBundlerOption {
	value: string
	label: string
	hint?: string
	disabled?: boolean
}

export function getBundlerOptions(framework: Framework): IBundlerOption[] {
	const supported = SUPPORTED[framework] ?? []
	return [
		{
			value: 'vite',
			label: 'Vite',
			disabled: !supported.includes('vite'),
		},
		{ value: 'webpack', label: 'Webpack' },
		{ value: 'esbuild', label: 'esbuild' },
		{
			value: 'rollup',
			label: 'Rollup',
			hint: 'coming soon',
			disabled: true,
		},
	]
}

export { SUPPORTED as SUPPORTED_MATRIX }

//#endregion Bundler Options for Prompts
