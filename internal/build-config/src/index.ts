import { existsSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import type { PluginOption } from 'vite'

const RELATIVE_IMPORT_RE =
	/(from\s+['"]|import\s*\(\s*['"])(\.\.?(?:\/[^'"]+)?)(['"])/g

/**
 * Rewrite relative imports in emitted .d.ts files to include explicit .js
 * extensions, correctly handling directory imports as `/index.js`.
 *
 * Uses the source tree (swaps /build/ → /src/) to distinguish files from
 * directories, since emit ordering is non-deterministic.
 *
 * Transforms:
 *   from './foo'           → from './foo.js'       (if ./foo.ts exists)
 *   from './foo'           → from './foo/index.js' (if ./foo/ directory)
 *   from '..'              → from '../index.js'
 *   import('./x')          → import('./x.js')
 *
 * Leaves unchanged:
 *   - bare module specifiers (e.g. 'react', '@wolf-tui/shared')
 *   - paths already ending in .js / .mjs / .cjs / .json
 */
export function addJsExtensions(filePath: string, content: string): string {
	const emitDir = dirname(filePath)
	// Infer the source dir by swapping /build → /src in the path.
	const srcDir = emitDir.replace(/\/build(\/|$)/, '/src$1')

	return content.replace(
		RELATIVE_IMPORT_RE,
		(match, pre: string, spec: string, post: string) => {
			if (/\.(js|mjs|cjs|json)$/.test(spec)) return match

			const resolved = resolve(srcDir, spec)
			const isDirectory =
				existsSync(resolved) && statSync(resolved).isDirectory()

			if (spec === '.' || spec === '..' || isDirectory) {
				return `${pre}${spec}/index.js${post}`
			}
			return `${pre}${spec}.js${post}`
		}
	)
}

export interface IDtsPluginOptions {
	/**
	 * When true, vite-plugin-dts flattens all types into a single bundle
	 * (no relative imports, so no extension rewriting needed).
	 *
	 * Default: false (per-file emission + extension rewriting).
	 */
	rollupTypes?: boolean
}

/**
 * Pre-configured `vite-plugin-dts` that emits per-file .d.ts with explicit
 * .js extensions on relative imports — required for Node16 / NodeNext ESM
 * consumers.
 */
export function createDtsPlugin(options: IDtsPluginOptions = {}): PluginOption {
	return dts({
		rollupTypes: options.rollupTypes ?? false,
		beforeWriteFile: (filePath, content) =>
			filePath.endsWith('.d.ts')
				? { filePath, content: addJsExtensions(filePath, content) }
				: undefined,
	})
}
