import { existsSync, readdirSync, mkdirSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'

//#region Package Manager Detection

export function detectPackageManager(): 'npm' | 'pnpm' | 'yarn' | 'bun' {
	const agent = process.env['npm_config_user_agent'] ?? ''
	if (agent.startsWith('pnpm')) return 'pnpm'
	if (agent.startsWith('yarn')) return 'yarn'
	if (agent.startsWith('bun')) return 'bun'
	return 'npm'
}

//#endregion Package Manager Detection

//#region Node Version Check

export function checkNodeVersion(
	version: string = process.version
): string | null {
	const major = parseInt(version.slice(1))
	if (major < 20) {
		return `wolf-tui requires Node.js >= 20. You have ${version}.`
	}
	return null
}

//#endregion Node Version Check

//#region Directory Handling

export type DirAction = 'overwrite' | 'merge' | 'cancel'

export function isDirEmpty(dir: string): boolean {
	if (!existsSync(dir)) return true
	return readdirSync(dir).length === 0
}

export function prepareTargetDir(dir: string, action: DirAction): void {
	if (action === 'overwrite' && existsSync(dir)) {
		rmSync(dir, { recursive: true, force: true })
	}
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true })
	}
}

//#endregion Directory Handling

//#region Install Dependencies

export function runInstall(
	targetDir: string,
	pm: string
): { ok: boolean; error?: string } {
	try {
		execSync(`${pm} install`, { cwd: targetDir, stdio: 'pipe' })
		return { ok: true }
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return { ok: false, error: message }
	}
}

//#endregion Install Dependencies

//#region Git Init

export function initGit(targetDir: string): boolean {
	try {
		execSync('git init', { cwd: targetDir, stdio: 'pipe' })
		return true
	} catch {
		return false
	}
}

//#endregion Git Init
