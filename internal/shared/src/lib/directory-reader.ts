import { readdir, stat, readlink, realpath } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'

//#region Types
export type EntryKind = 'file' | 'directory' | 'symlink'

export type IFileEntry = {
	name: string
	path: string
	kind: EntryKind
	size: number
	modifiedMs: number
	symlinkTarget?: string
	symlinkTargetKind?: EntryKind
}
//#endregion Types

//#region Reader
export async function readDirectory(
	dirPath: string,
	options: { showHidden?: boolean } = {}
): Promise<IFileEntry[]> {
	const resolvedPath = resolve(dirPath)
	const entries = await readdir(resolvedPath, { withFileTypes: true })
	const results: IFileEntry[] = []

	for (const entry of entries) {
		if (!options.showHidden && entry.name.startsWith('.')) {
			continue
		}

		const fullPath = join(resolvedPath, entry.name)

		try {
			let kind: EntryKind
			let symlinkTarget: string | undefined

			let symlinkTargetKind: EntryKind | undefined

			if (entry.isSymbolicLink()) {
				kind = 'symlink'
				try {
					symlinkTarget = await readlink(fullPath)
					const resolvedTarget = await realpath(fullPath)
					const targetStat = await stat(resolvedTarget)
					symlinkTargetKind = targetStat.isDirectory() ? 'directory' : 'file'
				} catch {
					// broken symlink — still list it
				}
			} else if (entry.isDirectory()) {
				kind = 'directory'
			} else {
				kind = 'file'
			}

			const stats = await stat(fullPath).catch(() => undefined)

			results.push({
				name: entry.name,
				path: fullPath,
				kind,
				size: stats?.size ?? 0,
				modifiedMs: stats?.mtimeMs ?? 0,
				symlinkTarget,
				symlinkTargetKind,
			})
		} catch {
			// permission denied or other fs error — skip entry
		}
	}

	// Directories (and symlinks-to-directories) first, then files, alphabetical within groups
	const isDirLike = (e: IFileEntry): boolean =>
		e.kind === 'directory' ||
		(e.kind === 'symlink' && e.symlinkTargetKind === 'directory')

	results.sort((a, b) => {
		const aDir = isDirLike(a)
		const bDir = isDirLike(b)
		if (aDir && !bDir) return -1
		if (!aDir && bDir) return 1
		return a.name.localeCompare(b.name)
	})

	return results
}
//#endregion Reader

//#region Helpers
export function getParentDirectory(dirPath: string): string {
	return dirname(resolve(dirPath))
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	if (bytes < 1024 * 1024 * 1024)
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
//#endregion Helpers
