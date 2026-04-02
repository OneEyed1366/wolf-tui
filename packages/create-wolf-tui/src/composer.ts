import { readFileSync } from 'node:fs'
import { render as renderEjs } from 'ejs'
import type {
	ILayer,
	IProjectConfig,
	IComposedProject,
	IConfigPatch,
	IPackageJsonPatch,
	ITsconfigPatch,
	IFileContribution,
} from './types'
import { isSupported, getBlockedMessage } from './matrix'

//#region Package.json Merge

export function mergePackageJson(layers: ILayer[]): IPackageJsonPatch {
	const deps: Record<string, string> = {}
	const devDeps: Record<string, string> = {}
	const scripts: Record<string, string> = {}

	for (const layer of layers) {
		if (!layer.packageJson) continue
		if (layer.packageJson.dependencies)
			Object.assign(deps, layer.packageJson.dependencies)
		if (layer.packageJson.devDependencies)
			Object.assign(devDeps, layer.packageJson.devDependencies)
		if (layer.packageJson.scripts)
			Object.assign(scripts, layer.packageJson.scripts)
	}

	return {
		dependencies: Object.keys(deps).length > 0 ? deps : undefined,
		devDependencies: Object.keys(devDeps).length > 0 ? devDeps : undefined,
		scripts: Object.keys(scripts).length > 0 ? scripts : undefined,
	}
}

//#endregion Package.json Merge

//#region Tsconfig Merge

export function mergeTsconfig(layers: ILayer[]): ITsconfigPatch {
	const compilerOptions: Record<string, unknown> = {}
	const includeSet = new Set<string>()

	for (const layer of layers) {
		if (!layer.tsconfig) continue
		if (layer.tsconfig.compilerOptions) {
			Object.assign(compilerOptions, layer.tsconfig.compilerOptions)
		}
		if (layer.tsconfig.include) {
			for (const inc of layer.tsconfig.include) {
				includeSet.add(inc)
			}
		}
	}

	return {
		compilerOptions:
			Object.keys(compilerOptions).length > 0 ? compilerOptions : undefined,
		include: includeSet.size > 0 ? [...includeSet] : undefined,
	}
}

//#endregion Tsconfig Merge

//#region Externals Merge

export function mergeExternals(layers: ILayer[]): string[] {
	const set = new Set<string>()
	for (const layer of layers) {
		if (layer.externals) {
			for (const ext of layer.externals) {
				set.add(ext)
			}
		}
	}
	return [...set]
}

//#endregion Externals Merge

//#region Template Vars Merge

export function mergeTemplateVars(layers: ILayer[]): Record<string, unknown> {
	const vars: Record<string, unknown> = {}
	for (const layer of layers) {
		if (layer.templateVars) {
			Object.assign(vars, layer.templateVars)
		}
	}
	return vars
}

//#endregion Template Vars Merge

//#region Slot Resolution

export function resolveSlots(
	patches: IConfigPatch[]
): Map<string, Map<string, string>> {
	const byTarget = new Map<string, IConfigPatch[]>()
	for (const patch of patches) {
		const list = byTarget.get(patch.target) ?? []
		list.push(patch)
		byTarget.set(patch.target, list)
	}

	const result = new Map<string, Map<string, string>>()

	for (const [target, targetPatches] of byTarget) {
		const slotMap = new Map<string, string>()

		const bySlot = new Map<string, IConfigPatch[]>()
		for (const patch of targetPatches) {
			const list = bySlot.get(patch.slot) ?? []
			list.push(patch)
			bySlot.set(patch.slot, list)
		}

		for (const [slot, slotPatches] of bySlot) {
			const overrides = slotPatches.filter((p) => p.mode === 'override')
			if (overrides.length > 0) {
				slotMap.set(slot, overrides[overrides.length - 1]!.content)
			} else {
				const sorted = [...slotPatches].sort(
					(a, b) => (a.priority ?? 100) - (b.priority ?? 100)
				)
				slotMap.set(slot, sorted.map((p) => p.content).join('\n'))
			}
		}

		result.set(target, slotMap)
	}

	return result
}

//#endregion Slot Resolution

//#region File Collection

function collectFiles(layers: ILayer[]): Map<string, IFileContribution> {
	const files = new Map<string, IFileContribution>()
	for (const layer of layers) {
		if (!layer.files) continue
		for (const [path, contribution] of Object.entries(layer.files)) {
			files.set(path, contribution)
		}
	}
	return files
}

//#endregion File Collection

//#region EJS Rendering

function renderTemplate(
	templatePath: string,
	data: Record<string, unknown>
): string {
	const template = readFileSync(templatePath, 'utf-8')
	return renderEjs(template, data)
}

//#endregion EJS Rendering

//#region Layer Registry (static imports — Vite can't resolve dynamic template literals)

import { baseLayer } from './layers/base'
import { reactLayer } from './layers/frameworks/react'
import { vueLayer } from './layers/frameworks/vue'
import { angularLayer } from './layers/frameworks/angular'
import { solidLayer } from './layers/frameworks/solid'
import { svelteLayer } from './layers/frameworks/svelte'
import { viteLayer } from './layers/bundlers/vite'
import { webpackLayer } from './layers/bundlers/webpack'
import { esbuildLayer } from './layers/bundlers/esbuild'
import { getInteraction } from './layers/interactions/registry'
import { tailwindLayer } from './layers/css/tailwind'
import { sassLayer } from './layers/css/sass'
import { lessLayer } from './layers/css/less'
import { stylusLayer } from './layers/css/stylus'
import { lintLayer } from './layers/lint'
import type { Framework, Bundler, CssPreprocessor } from './types'

const frameworkLayers: Record<Framework, ILayer> = {
	react: reactLayer,
	vue: vueLayer,
	angular: angularLayer,
	solid: solidLayer,
	svelte: svelteLayer,
}

const bundlerLayers: Record<Bundler, ILayer> = {
	vite: viteLayer,
	webpack: webpackLayer,
	esbuild: esbuildLayer,
}

const preprocessorLayers: Record<CssPreprocessor, ILayer> = {
	sass: sassLayer,
	less: lessLayer,
	stylus: stylusLayer,
}

//#endregion Layer Registry

//#region Collect Layers

export function collectLayers(config: IProjectConfig): ILayer[] {
	const layers: ILayer[] = [baseLayer]

	const fwLayer = frameworkLayers[config.framework]
	if (fwLayer) layers.push(fwLayer)

	const bunLayer = bundlerLayers[config.bundler]
	if (bunLayer) layers.push(bunLayer)

	const interaction = getInteraction(config.framework, config.bundler)
	if (interaction) layers.push(interaction)

	if (config.tailwind) layers.push(tailwindLayer)

	if (config.cssPreprocessor) {
		const prepLayer = preprocessorLayers[config.cssPreprocessor]
		if (prepLayer) layers.push(prepLayer)
	}

	if (config.lint) {
		layers.push(lintLayer(config.framework))
	}

	return layers
}

//#endregion Collect Layers

//#region Compose

export function compose(config: IProjectConfig): IComposedProject {
	if (!isSupported(config.framework, config.bundler)) {
		throw new Error(getBlockedMessage(config.framework, config.bundler))
	}

	const layers = collectLayers(config)
	const warnings: string[] = []

	const pkgPatch = mergePackageJson(layers)
	const tsconfigPatch = mergeTsconfig(layers)
	const externals = mergeExternals(layers)
	const vars = mergeTemplateVars(layers)

	// Collect config patches from all layers
	const allPatches: IConfigPatch[] = []
	for (const layer of layers) {
		if (layer.configPatches) {
			allPatches.push(...layer.configPatches)
		}
	}
	const slotsMap = resolveSlots(allPatches)

	// Collect file contributions
	const fileContributions = collectFiles(layers)
	const files = new Map<string, string>()

	for (const [filePath, contribution] of fileContributions) {
		switch (contribution.type) {
			case 'static': {
				const content = readFileSync(contribution.source, 'utf-8')
				files.set(filePath, content)
				break
			}
			case 'template': {
				const targetSlots = slotsMap.get(filePath)
				const content = renderTemplate(contribution.source, {
					framework: config.framework,
					bundler: config.bundler,
					externals,
					vars,
					slots: targetSlots ? Object.fromEntries(targetSlots) : {},
					...contribution.data,
				})
				files.set(filePath, content)
				break
			}
			case 'generated':
				files.set(filePath, contribution.content)
				break
		}
	}

	// Build package.json
	const packageJson: Record<string, unknown> = {
		name: config.name,
		private: true,
		type: 'module',
		scripts: pkgPatch.scripts ?? {},
		dependencies: pkgPatch.dependencies ?? {},
		devDependencies: pkgPatch.devDependencies ?? {},
	}

	// Build tsconfig.json
	const tsconfig: Record<string, unknown> = {
		compilerOptions: {
			target: 'ES2022',
			module: 'ESNext',
			moduleResolution: 'bundler',
			strict: true,
			esModuleInterop: true,
			skipLibCheck: true,
			...tsconfigPatch.compilerOptions,
		},
		include: tsconfigPatch.include ?? ['src'],
	}

	const composed: IComposedProject = {
		files,
		packageJson,
		tsconfig,
		warnings,
	}

	// Run validators
	for (const layer of layers) {
		if (layer.validate) {
			warnings.push(...layer.validate(composed))
		}
	}

	return composed
}

//#endregion Compose
