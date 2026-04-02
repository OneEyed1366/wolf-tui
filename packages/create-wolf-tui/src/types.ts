//#region Framework & Bundler

export type Framework = 'react' | 'vue' | 'angular' | 'solid' | 'svelte'
export type Bundler = 'vite' | 'webpack' | 'esbuild'
export type CssPreset = 'tailwind' | 'sass' | 'less' | 'stylus'
export type CssPreprocessor = 'sass' | 'less' | 'stylus'

//#endregion Framework & Bundler

//#region Layer

export interface ILayer {
	id: string
	files?: Record<string, IFileContribution>
	packageJson?: IPackageJsonPatch
	tsconfig?: ITsconfigPatch
	externals?: string[]
	templateVars?: Record<string, unknown>
	configPatches?: IConfigPatch[]
	validate?: (composed: IComposedProject) => string[]
}

export interface IConfigPatch {
	target: string
	slot: string
	content: string
	mode: 'add' | 'override'
	priority?: number
}

export type IFileContribution =
	| { type: 'static'; source: string }
	| { type: 'template'; source: string; data?: Record<string, unknown> }
	| { type: 'generated'; content: string }

//#endregion Layer

//#region Package & Tsconfig Patches

export interface IPackageJsonPatch {
	dependencies?: Record<string, string>
	devDependencies?: Record<string, string>
	scripts?: Record<string, string>
}

export interface ITsconfigPatch {
	compilerOptions?: Record<string, unknown>
	include?: string[]
}

//#endregion Package & Tsconfig Patches

//#region Project Config & Composed Output

export interface IProjectConfig {
	name: string
	framework: Framework
	bundler: Bundler
	tailwind: boolean
	cssPreprocessor?: CssPreprocessor
	lint: boolean
	git: boolean
	install: boolean
	targetDir: string
	overwrite?: boolean
}

export interface IComposedProject {
	files: Map<string, string>
	packageJson: Record<string, unknown>
	tsconfig: Record<string, unknown>
	warnings: string[]
}

//#endregion Project Config & Composed Output
