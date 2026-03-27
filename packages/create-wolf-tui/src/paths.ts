import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

//#region Path Resolution

/**
 * Find the package root by looking for package.json.
 * Works from both src/ (dev/test) and dist/ (production).
 */
function findPackageRoot(): string {
	let dir = __dirname
	for (let i = 0; i < 5; i++) {
		if (existsSync(resolve(dir, 'package.json'))) {
			return dir
		}
		dir = dirname(dir)
	}
	// Fallback: assume 2 levels up from src/ or dist/shared/
	return resolve(__dirname, '..', '..')
}

const PKG_ROOT = findPackageRoot()

export const TEMPLATE_FILES = resolve(PKG_ROOT, 'template-files')

export function starterDir(framework: string): string {
	return resolve(PKG_ROOT, 'src', 'templates', 'starter', framework)
}

//#endregion Path Resolution
