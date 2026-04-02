import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import type { IComposedProject } from './types'

//#region Render to Disk

export function renderProject(
	composed: IComposedProject,
	targetDir: string
): void {
	ensureDir(targetDir)

	// Write package.json
	const pkgPath = join(targetDir, 'package.json')
	writeFileSync(
		pkgPath,
		JSON.stringify(composed.packageJson, null, '\t') + '\n'
	)

	// Write tsconfig.json
	const tscPath = join(targetDir, 'tsconfig.json')
	writeFileSync(tscPath, JSON.stringify(composed.tsconfig, null, '\t') + '\n')

	// Write all composed files
	for (const [filePath, content] of composed.files) {
		const fullPath = join(targetDir, filePath)
		ensureDir(dirname(fullPath))
		writeFileSync(fullPath, content)
	}
}

//#endregion Render to Disk

//#region Helpers

function ensureDir(dir: string): void {
	mkdirSync(dir, { recursive: true })
}

//#endregion Helpers
