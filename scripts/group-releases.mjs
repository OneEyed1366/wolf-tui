#!/usr/bin/env node
/**
 * Aggregate per-package GitHub releases into a single dated release.
 *
 * Designed to run as a post-step after Release Please in CI. Reads the freshly
 * created per-package releases for the current run, builds one aggregated
 * release with a combined changelog, and deletes the per-package GitHub
 * releases (git tags are preserved — release-please still needs them).
 *
 * Required env:
 *   GH_TOKEN            GitHub token with `repo` and `workflow` scopes
 *   GITHUB_REPOSITORY   owner/repo (set automatically by GitHub Actions)
 *   PATHS_RELEASED      JSON array from release-please's paths_released output
 *
 * Optional env:
 *   DRY_RUN=1           Show plan without making changes
 */

import { execSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const repo = process.env.GITHUB_REPOSITORY
const pathsReleasedRaw = process.env.PATHS_RELEASED || '[]'
const dryRun = process.env.DRY_RUN === '1'

if (!repo) {
	console.error('GITHUB_REPOSITORY is required')
	process.exit(1)
}

const pathsReleased = JSON.parse(pathsReleasedRaw)
if (pathsReleased.length === 0) {
	console.log('No paths released, nothing to do')
	process.exit(0)
}

console.log(`Repo: ${repo}`)
console.log(`Mode: ${dryRun ? 'DRY-RUN' : 'APPLY'}`)
console.log(`Paths released: ${pathsReleased.join(', ')}`)

/**
 * Resolve which release-please component lives at each path
 * by reading .release-please-config.json.
 */
const config = JSON.parse(
	execSync('cat .release-please-config.json', { encoding: 'utf8' })
)
const pathToComponent = {}
for (const [path, cfg] of Object.entries(config.packages || {})) {
	pathToComponent[path] = cfg.component || path.split('/').pop()
}

/**
 * Fetch the most recent N releases via gh CLI.
 * We look at recently published releases (last 30) and match those whose
 * tag's component aligns with one of paths_released.
 */
function gh(args) {
	return execSync(`gh ${args} --repo ${repo}`, {
		encoding: 'utf8',
		stdio: ['pipe', 'pipe', 'pipe'],
	})
}

function listRecent() {
	const json = gh(
		`release list --limit 30 --json tagName,name,publishedAt,isLatest,createdAt`
	)
	return JSON.parse(json).map((r) => ({
		...r,
		ts: new Date(r.createdAt),
	}))
}

function viewRelease(tag) {
	const json = gh(
		`release view "${tag}" --json tagName,body,targetCommitish,publishedAt`
	)
	return JSON.parse(json)
}

const components = pathsReleased.map((p) => pathToComponent[p]).filter(Boolean)

console.log(`Components in this release: ${components.join(', ')}`)

// Find the fresh per-package releases that match the components from this run.
// Per-package release tags look like: `react@v1.10.0`, `core@v1.9.0`, etc.
const allRecent = listRecent()
const fresh = allRecent
	.filter((r) => {
		if (!r.tagName.includes('@')) return false
		const [component] = r.tagName.split('@', 1)
		return components.includes(component)
	})
	// only consider very recent ones (created within the last 30 minutes)
	.filter((r) => Date.now() - r.ts.getTime() < 30 * 60 * 1000)

if (fresh.length === 0) {
	console.log(
		'No fresh per-package releases matching components — nothing to aggregate'
	)
	process.exit(0)
}

if (fresh.length === 1) {
	console.log(
		'Only one package released — leaving the per-package release as-is'
	)
	process.exit(0)
}

console.log(`Found ${fresh.length} fresh per-package releases to aggregate`)

// Fetch full bodies + targetCommitish
const details = fresh.map((r) => ({ ...r, ...viewRelease(r.tagName) }))
const anchor = details[0].targetCommitish
const releaseDate = details[0].publishedAt.slice(0, 10) // YYYY-MM-DD

// Disambiguate when multiple releases happen on the same day
const existingForDate = allRecent.filter((r) =>
	r.tagName.startsWith(`release-${releaseDate}`)
)
const label =
	existingForDate.length === 0
		? `release-${releaseDate}`
		: `release-${releaseDate}-${new Date().toISOString().slice(11, 16).replace(':', '')}`

const lines = [
	`# Release ${releaseDate}`,
	'',
	`_Aggregated release covering ${details.length} package(s)._`,
	'',
]

for (const r of details) {
	const [pkg, ver] = r.tagName.split('@', 2)
	lines.push(`## \`@wolf-tui/${pkg}\` ${ver}`)
	lines.push('')
	const body = (r.body || '').trim()
	if (body) {
		const bodyLines = body.split('\n')
		// strip the leading "## [x.y.z](...)" heading to avoid duplicate version heading
		const startIdx = bodyLines[0]?.startsWith('## [') ? 1 : 0
		lines.push(...bodyLines.slice(startIdx))
	} else {
		lines.push('_No release notes._')
	}
	lines.push('')
}

const changelog = lines.join('\n')

if (dryRun) {
	console.log('--- planned changelog ---')
	console.log(changelog)
	console.log('---')
	console.log(`Would create release: ${label} at ${anchor.slice(0, 8)}`)
	for (const r of details) {
		console.log(`Would delete: ${r.tagName}`)
	}
	process.exit(0)
}

// Create the aggregated release
const notesFile = join(tmpdir(), `release-notes-${Date.now()}.md`)
writeFileSync(notesFile, changelog, 'utf8')

console.log(`Creating aggregate release ${label} at ${anchor.slice(0, 8)}`)
try {
	gh(
		`release create "${label}" --title "Release ${releaseDate}" --notes-file "${notesFile}" --target "${anchor}"`
	)
	console.log('  ok')
} catch (e) {
	console.error('Failed to create aggregate release:', e.message)
	unlinkSync(notesFile)
	process.exit(1)
} finally {
	try {
		unlinkSync(notesFile)
	} catch {}
}

// Delete per-package GitHub releases (preserves git tags via --cleanup-tag=false)
for (const r of details) {
	try {
		gh(`release delete "${r.tagName}" --yes --cleanup-tag=false`)
		console.log(`  - deleted: ${r.tagName}`)
	} catch (e) {
		console.error(`  ! failed to delete ${r.tagName}: ${e.message}`)
	}
}

console.log('Done')
