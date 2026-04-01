#!/usr/bin/env node
/**
 * Screenshot scaffolded projects.
 * Installs from npm, builds, runs headlessly, captures ANSI -> PNG.
 *
 * Usage:
 *   node screenshot-scaffolds.mjs              # all scaffolds
 *   node screenshot-scaffolds.mjs solid         # only names containing "solid"
 *   node screenshot-scaffolds.mjs solid_vite    # only names containing "solid_vite"
 *
 * Output: scaffolds/__screenshots__/{name}.png
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { chromium } from 'playwright'
import AnsiToHtml from 'ansi-to-html'

const SCAFFOLDS = resolve('scaffolds')
const SCREENSHOTS = resolve('scaffolds/__screenshots__')

//#region ANSI -> HTML -> PNG pipeline

const converter = new AnsiToHtml({
	fg: '#cdd6f4',
	bg: '#1e1e2e',
	colors: {
		0: '#45475a',
		1: '#f38ba8',
		2: '#a6e3a1',
		3: '#f9e2af',
		4: '#89b4fa',
		5: '#f5c2e7',
		6: '#94e2d5',
		7: '#bac2de',
		8: '#585b70',
		9: '#f38ba8',
		10: '#a6e3a1',
		11: '#f9e2af',
		12: '#89b4fa',
		13: '#f5c2e7',
		14: '#94e2d5',
		15: '#a6adc8',
	},
})

function wrapInHtml(ansiHtml, title) {
	return `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
	background: #181825;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	padding: 20px;
}
.terminal {
	background: #1e1e2e;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 8px 32px rgba(0,0,0,0.5);
	border: 1px solid #313244;
}
.terminal-chrome {
	background: #313244;
	padding: 8px 12px;
	display: flex;
	gap: 6px;
	align-items: center;
}
.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot-red { background: #f38ba8; }
.dot-yellow { background: #f9e2af; }
.dot-green { background: #a6e3a1; }
.title {
	color: #6c7086;
	font-family: 'SF Mono', monospace;
	font-size: 12px;
	margin-left: 8px;
}
.terminal-content {
	padding: 16px;
	font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 14px;
	line-height: 1.4;
	color: #cdd6f4;
	white-space: pre;
	overflow: hidden;
}
</style>
</head>
<body>
<div class="terminal">
	<div class="terminal-chrome">
		<div class="dot dot-red"></div>
		<div class="dot dot-yellow"></div>
		<div class="dot dot-green"></div>
		<span class="title">${title}</span>
	</div>
	<div class="terminal-content">${ansiHtml}</div>
</div>
</body>
</html>`
}

//#endregion

//#region Extract clean ANSI frame

function extractFrame(rawOutput) {
	const lines = rawOutput.split('\n')
	const frameLines = []
	let inFrame = false

	for (const line of lines) {
		// Strip cursor/erase CSI codes but KEEP SGR color codes (ending in 'm')
		// Colors are needed for ansi-to-html; cursor codes would produce garbage
		const colorLine = line
			.replace(/\x1b\[[\?]?[0-9;]*[A-Za-ln-z]/g, '')
			.replace(/\x1b[()][A-Z0-9]/g, '')
			.replace(/\r/g, '')

		// Strip ALL CSI codes (including colors) for content detection
		const stripped = colorLine.replace(/\x1b\[[0-9;]*m/g, '')

		if (!stripped.trim()) {
			if (inFrame) frameLines.push(colorLine)
			continue
		}

		if (
			stripped.includes('╭') ||
			stripped.includes('╰') ||
			stripped.includes('┌') ||
			stripped.includes('│') ||
			stripped.includes('└') ||
			stripped.includes('wolf-tui') ||
			stripped.includes('↑') ||
			stripped.includes('↓') ||
			(inFrame && !stripped.includes('ERROR') && !stripped.includes('Raw mode'))
		) {
			inFrame = true
			frameLines.push(colorLine)
		}

		if (stripped.includes('ERROR') || stripped.includes('Raw mode')) break
	}

	return frameLines.join('\n').trim()
}

//#endregion

//#region Targets — auto-discover from scaffolds/

const filter = process.argv[2] || ''

if (!existsSync(SCAFFOLDS)) {
	console.error('No scaffolds/ directory. Run scaffold-all.mjs first.')
	process.exit(1)
}

const TARGETS = readdirSync(SCAFFOLDS)
	.filter(
		(name) =>
			!name.startsWith('.') &&
			!name.startsWith('__') &&
			existsSync(join(SCAFFOLDS, name, 'package.json')) &&
			name.includes(filter)
	)
	.sort()

console.log(
	`Found ${TARGETS.length} scaffolds${filter ? ` matching "${filter}"` : ''}`
)

//#endregion

//#region Main

mkdirSync(SCREENSHOTS, { recursive: true })

console.log('Launching browser...')
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 900, height: 600 } })

const results = []

for (const name of TARGETS) {
	const dir = join(SCAFFOLDS, name)
	if (!existsSync(join(dir, 'package.json'))) {
		console.log(`  - ${name}: not found`)
		results.push({ name, status: 'skip' })
		continue
	}

	process.stdout.write(`  ${name}... `)
	const fw = name.split('_')[0]

	try {
		// npm install from npm registry
		if (!existsSync(join(dir, 'node_modules'))) {
			execSync('npm install 2>&1', {
				cwd: dir,
				stdio: 'pipe',
				timeout: 120_000,
			})
		}

		// Build
		execSync('npm run build 2>&1', { cwd: dir, stdio: 'pipe', timeout: 60_000 })

		// Find output file
		let outFile = 'dist/index.cjs'
		if (!existsSync(join(dir, outFile))) outFile = 'dist/index.js'

		// Svelte needs --conditions=browser for client-side rendering
		const nodeFlags = fw === 'svelte' ? '--conditions=browser' : ''

		// Run and capture ANSI output
		let rawOutput = ''
		try {
			rawOutput = execSync(
				`WOLFIE_VERIFY=1 node ${nodeFlags} ${outFile} 2>&1`,
				{ cwd: dir, stdio: 'pipe', timeout: 5_000 }
			).toString()
		} catch (e) {
			rawOutput = (e.stdout?.toString() || '') + (e.stderr?.toString() || '')
		}

		// Extract the rendered frame
		const frame = extractFrame(rawOutput)

		if (!frame || frame.length < 20) {
			console.log('no frame captured')
			results.push({ name, status: 'no-frame', raw: rawOutput.slice(0, 300) })
			continue
		}

		// Convert to HTML and screenshot
		const ansiHtml = converter.toHtml(frame)
		const html = wrapInHtml(ansiHtml, name)

		await page.setContent(html, { waitUntil: 'networkidle' })

		const termBox = await page.locator('.terminal').boundingBox()
		if (termBox) {
			await page.setViewportSize({
				width: Math.ceil(termBox.width) + 40,
				height: Math.ceil(termBox.height) + 40,
			})
		}

		const pngPath = join(SCREENSHOTS, `${name}.png`)
		await page.locator('.terminal').screenshot({ path: pngPath })

		console.log('✓ screenshot saved')
		results.push({ name, status: 'pass', path: pngPath })
	} catch (err) {
		console.log(`✗ ${err.message?.slice(0, 100)}`)
		results.push({ name, status: 'fail', error: err.message?.slice(0, 300) })
	}
}

await page.close()
await browser.close()

// Summary
console.log('\n  Results:')
const passed = results.filter((r) => r.status === 'pass')
const noFrame = results.filter((r) => r.status === 'no-frame')
const failed = results.filter((r) => r.status === 'fail')

console.log(
	`  ${passed.length} screenshots, ${noFrame.length} no-frame, ${failed.length} failed\n`
)

if (passed.length > 0) {
	console.log('  Screenshots:')
	for (const r of passed) console.log(`    ✓ ${r.name}.png`)
}

if (noFrame.length > 0) {
	console.log('\n  No frame:')
	for (const r of noFrame)
		console.log(`    ? ${r.name}: ${r.raw?.slice(0, 150)}`)
}

if (failed.length > 0) {
	console.log('\n  Failed:')
	for (const r of failed)
		console.log(`    ✗ ${r.name}: ${r.error?.slice(0, 150)}`)
}

//#endregion
