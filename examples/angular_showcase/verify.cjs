// examples/angular_showcase/verify.cjs
// Headless verification of all 5 community components (Angular adapter)
// MUST set env BEFORE requiring bundle (zone.js patches timers on import)
process.env.WOLFIE_VERIFY = '1'
const { EventEmitter } = require('events')

//#region Fake Streams
function createFakeStream(cols, rows) {
	const ee = new EventEmitter()
	ee.columns = cols
	ee.rows = rows
	const frames = []
	ee.write = (data) => {
		frames.push(data)
		return true
	}
	ee.get = () => frames[frames.length - 1] ?? ''
	ee.frameCount = () => frames.length
	ee.getFrame = (i) => frames[i] ?? ''
	return ee
}

function createFakeStdin() {
	const ee = new EventEmitter()
	ee.isTTY = true
	ee.setRawMode = () => {}
	ee.setEncoding = () => {}
	ee.read = () => null
	ee.unref = () => {}
	ee.ref = () => {}
	return ee
}
//#endregion Fake Streams

//#region Helpers
const DOWN = '\x1b[B'
const UP = '\x1b[A'
const RIGHT = '\x1b[C'
const ENTER = '\r'
const ESC = '\x1b'
//#endregion Helpers

async function verify() {
	const { AppComponent } = require('./dist/index.cjs')
	const { renderWolfie } = require('@wolf-tui/angular')
	const { NgZone } = require('@angular/core')
	const stripAnsiMod = require('strip-ansi')
	const stripAnsi = stripAnsiMod.default ?? stripAnsiMod

	const stdout = createFakeStream(80, 30)
	const stdin = createFakeStdin()
	const stderr = createFakeStream(80, 30)

	const ngZone = new NgZone({ enableLongStackTrace: false })
	const delay = (ms) =>
		new Promise((r) => ngZone.runOutsideAngular(() => setTimeout(r, ms)))

	const instance = await renderWolfie(AppComponent, {
		stdout,
		stdin,
		stderr,
		debug: true,
		exitOnCtrlC: false,
		incrementalRendering: false,
	})

	await delay(500)

	const frame = stripAnsi(stdout.get())
	console.log('=== MENU ===')
	console.log(frame)
	console.log()

	const checks = []

	// Helper: navigate menu to index N and press Enter
	async function openDemo(menuIndex) {
		// First go back to top
		for (let i = 0; i < 5; i++) stdin.emit('data', UP)
		await delay(50)
		// Navigate down to target
		for (let i = 0; i < menuIndex; i++) {
			stdin.emit('data', DOWN)
			await delay(50)
		}
		stdin.emit('data', ENTER)
		await delay(300)
	}

	//#region Timer
	console.log('--- Timer ---')
	await openDemo(0)
	let timerFrame = stripAnsi(stdout.get())
	console.log(timerFrame)
	const hasTimer = timerFrame.includes('Timer Demo')
	checks.push({ name: 'Timer renders', pass: hasTimer })
	console.log('Timer renders:', hasTimer ? 'PASS' : 'FAIL')

	stdin.emit('data', ESC)
	await delay(200)
	//#endregion Timer

	//#region TreeView
	console.log('\n--- TreeView ---')
	await openDemo(1)
	let treeFrame = stripAnsi(stdout.get())
	console.log(treeFrame)
	const hasTree = treeFrame.includes('TreeView Demo')
	checks.push({ name: 'TreeView renders', pass: hasTree })
	console.log('TreeView renders:', hasTree ? 'PASS' : 'FAIL')

	// Test expand: press right arrow to expand a node
	stdin.emit('data', RIGHT)
	await delay(100)
	treeFrame = stripAnsi(stdout.get())
	const hasExpanded =
		treeFrame.includes('components') ||
		treeFrame.includes('utils') ||
		treeFrame.includes('index.ts')
	checks.push({ name: 'TreeView expand works', pass: hasExpanded })
	console.log('TreeView expand:', hasExpanded ? 'PASS' : 'FAIL')

	stdin.emit('data', ESC)
	await delay(200)
	//#endregion TreeView

	//#region Combobox
	console.log('\n--- Combobox ---')
	await openDemo(2)
	let comboFrame = stripAnsi(stdout.get())
	console.log(comboFrame)
	const hasCombo = comboFrame.includes('Combobox Demo')
	checks.push({ name: 'Combobox renders', pass: hasCombo })
	console.log('Combobox renders:', hasCombo ? 'PASS' : 'FAIL')

	stdin.emit('data', ESC)
	await delay(100)
	stdin.emit('data', ESC) // double-Escape to exit Combobox demo
	await delay(200)
	//#endregion Combobox

	//#region JsonViewer
	console.log('\n--- JsonViewer ---')
	await openDemo(3)
	let jsonFrame = stripAnsi(stdout.get())
	console.log(jsonFrame)
	const hasJson = jsonFrame.includes('JsonViewer Demo')
	checks.push({ name: 'JsonViewer renders', pass: hasJson })
	console.log('JsonViewer renders:', hasJson ? 'PASS' : 'FAIL')

	stdin.emit('data', ESC)
	await delay(200)
	//#endregion JsonViewer

	//#region FilePicker
	console.log('\n--- FilePicker ---')
	await openDemo(4)
	await delay(500) // extra time for directory read
	let fileFrame = stripAnsi(stdout.get())
	console.log(fileFrame)

	// Check last 5 frames for the header (async directory load may push it out)
	let hasFile = fileFrame.includes('FilePicker Demo')
	if (!hasFile) {
		const totalFrames = stdout.frameCount()
		for (let i = Math.max(0, totalFrames - 5); i < totalFrames; i++) {
			const f = stripAnsi(stdout.getFrame(i))
			if (f.includes('FilePicker Demo')) {
				hasFile = true
				console.log('(Found "FilePicker Demo" in frame', i, ')')
				break
			}
		}
	}

	// Fallback: if directory listing renders, the component is working
	if (!hasFile) {
		hasFile =
			fileFrame.includes('build/') || fileFrame.includes('node_modules/')
		if (hasFile)
			console.log('(FilePicker content present via directory listing)')
	}

	checks.push({ name: 'FilePicker renders', pass: hasFile })
	console.log('FilePicker renders:', hasFile ? 'PASS' : 'FAIL')
	//#endregion FilePicker

	//#region Summary
	console.log('\n=== SUMMARY ===')
	const passed = checks.filter((c) => c.pass).length
	const total = checks.length
	for (const c of checks) {
		console.log(`  ${c.pass ? 'PASS' : 'FAIL'} ${c.name}`)
	}
	console.log(`\n${passed}/${total} checks passed`)
	console.log('Total frames rendered:', stdout.frameCount())
	//#endregion Summary

	instance.unmount()
	process.exit(passed === total ? 0 : 1)
}

verify().catch((e) => {
	console.error('Verify failed:', e)
	process.exit(1)
})
