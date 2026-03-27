import type { Framework, Bundler, ILayer } from '../../types'
import { vueViteInteraction } from './vue-vite'
import { vueWebpackInteraction } from './vue-webpack'
import { vueEsbuildInteraction } from './vue-esbuild'
import { angularViteInteraction } from './angular-vite'
import { angularWebpackInteraction } from './angular-webpack'
import { angularEsbuildInteraction } from './angular-esbuild'
import { svelteViteInteraction } from './svelte-vite'
import { svelteWebpackInteraction } from './svelte-webpack'
import { svelteEsbuildInteraction } from './svelte-esbuild'
import { solidWebpackInteraction } from './solid-webpack'
import { solidEsbuildInteraction } from './solid-esbuild'
import { reactWebpackInteraction } from './react-webpack'

type InteractionKey = `${Framework}:${Bundler}`

const registry = new Map<InteractionKey, ILayer>([
	['vue:vite', vueViteInteraction],
	['vue:webpack', vueWebpackInteraction],
	['vue:esbuild', vueEsbuildInteraction],
	['angular:vite', angularViteInteraction],
	['angular:webpack', angularWebpackInteraction],
	['angular:esbuild', angularEsbuildInteraction],
	['svelte:vite', svelteViteInteraction],
	['svelte:webpack', svelteWebpackInteraction],
	['svelte:esbuild', svelteEsbuildInteraction],
	['solid:webpack', solidWebpackInteraction],
	['solid:esbuild', solidEsbuildInteraction],
	['react:webpack', reactWebpackInteraction],
])

export function getInteraction(fw: Framework, bun: Bundler): ILayer | null {
	return registry.get(`${fw}:${bun}`) ?? null
}
