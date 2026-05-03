// examples/solid_showcase/verify.cjs
// Headless verification of all 5 community components (Solid adapter)
'use strict'

// WHY: must set before import so solid-showcase skips real TTY mounting
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
	ee.unref = () => {}
	ee.ref = () => {}
	// WHY: Solid uses data events (same as Vue, unlike React's readable+read pattern)
	ee._send = (key) => ee.emit('data', Buffer.from(key))
	return ee
}
//#endregion Fake Streams

//#region Helpers
const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const DOWN = '\x1b[B'
const UP = '\x1b[A'
const RIGHT = '\x1b[C'
const ENTER = '\r'
const ESC = '\x1b'
//#endregion Helpers

async function verify() {
	const { App } = await import('./dist/index.js')
	const { render } = await import('@wolf-tui/solid')
	const { default: stripAnsiMod } = await import('strip-ansi')
	const stripAnsi =
		typeof stripAnsiMod === 'function' ? stripAnsiMod : stripAnsiMod.default

	const stdout = createFakeStream(80, 30)
	const stdin = createFakeStdin()
	const stderr = createFakeStream(80, 30)
	const send = (key) => stdin._send(key)

	// WHY: debug: false with maxFps: 30 prevents event loop starvation (Solid pattern)
	const instance = render(App, {
		stdout,
		stdin,
		stderr,
		debug: false,
		maxFps: 30,
		incrementalRendering: false,
	})

	await delay(300)

	const menuFrame = stripAnsi(stdout.get())
	if (!menuFrame.includes('Community Components Showcase')) {
		console.error('FAIL: menu did not render\n', menuFrame.slice(0, 500))
		process.exit(1)
	}
	console.log('OK: Menu screen rendered')

	const checks = []

	// Helper: navigate menu to index N and press Enter
	async function openDemo(menuIndex) {
		// First go back to top
		for (let i = 0; i < 5; i++) send(UP)
		await delay(100)
		// Navigate down to target
		for (let i = 0; i < menuIndex; i++) {
			send(DOWN)
			await delay(100)
		}
		send(ENTER)
		await delay(400)
	}

	//#region Timer
	console.log('--- Timer ---')
	await openDemo(0)
	const timerFrame = stripAnsi(stdout.get())
	const hasTimer = timerFrame.includes('Timer Demo')
	checks.push({ name: 'Timer renders', pass: hasTimer })
	console.log('Timer renders:', hasTimer ? 'OK' : 'FAIL')

	send(ESC)
	await delay(300)
	//#endregion Timer

	//#region TreeView
	console.log('--- TreeView ---')
	await openDemo(1)
	const treeFrame = stripAnsi(stdout.get())
	const hasTree = treeFrame.includes('TreeView Demo')
	checks.push({ name: 'TreeView renders', pass: hasTree })
	console.log('TreeView renders:', hasTree ? 'OK' : 'FAIL')

	// Test expand: press right arrow to expand a node
	send(RIGHT)
	await delay(200)
	const treeExpandedFrame = stripAnsi(stdout.get())
	const hasExpanded =
		treeExpandedFrame.includes('components') ||
		treeExpandedFrame.includes('utils') ||
		treeExpandedFrame.includes('index.ts')
	checks.push({ name: 'TreeView expand works', pass: hasExpanded })
	console.log('TreeView expand:', hasExpanded ? 'OK' : 'FAIL')

	send(ESC)
	await delay(300)
	//#endregion TreeView

	//#region Combobox
	console.log('--- Combobox ---')
	await openDemo(2)
	const comboFrame = stripAnsi(stdout.get())
	const hasCombo = comboFrame.includes('Combobox Demo')
	checks.push({ name: 'Combobox renders', pass: hasCombo })
	console.log('Combobox renders:', hasCombo ? 'OK' : 'FAIL')

	send(ESC)
	await delay(100)
	send(ESC) // double-Escape to exit Combobox demo
	await delay(300)
	//#endregion Combobox

	//#region JsonViewer
	console.log('--- JsonViewer ---')
	await openDemo(3)
	const jsonFrame = stripAnsi(stdout.get())
	const hasJson = jsonFrame.includes('JsonViewer Demo')
	checks.push({ name: 'JsonViewer renders', pass: hasJson })
	console.log('JsonViewer renders:', hasJson ? 'OK' : 'FAIL')

	send(ESC)
	await delay(300)
	//#endregion JsonViewer

	//#region FilePicker
	console.log('--- FilePicker ---')
	await openDemo(4)
	await delay(400) // extra time for directory read
	const fileFrame = stripAnsi(stdout.get())
	const hasFile = fileFrame.includes('FilePicker Demo')
	checks.push({ name: 'FilePicker renders', pass: hasFile })
	console.log('FilePicker renders:', hasFile ? 'OK' : 'FAIL')

	send(ESC)
	await delay(200)
	//#endregion FilePicker

	//#region Gradient
	console.log('--- Gradient ---')
	await openDemo(5)
	const gradStripped = stripAnsi(stdout.get())
	const gradRaw = stdout.get()
	console.log(gradStripped)
	const hasGrad = gradStripped.includes('Gradient Demo')
	const hasColors = /\x1b\[(?:38;[25];\d+(?:;\d+;\d+)?|3[0-7]|9[0-7])m/.test(
		gradRaw
	)
	checks.push({ name: 'Gradient renders', pass: hasGrad })
	checks.push({ name: 'Gradient emits ANSI colors', pass: hasColors })
	console.log('Gradient renders:', hasGrad ? 'OK' : 'FAIL')
	console.log('Gradient colors:', hasColors ? 'OK' : 'FAIL')
	//#endregion Gradient

	//#region Summary
	console.log('\n=== SUMMARY ===')
	const passed = checks.filter((c) => c.pass).length
	const total = checks.length
	for (const c of checks) {
		console.log(`  ${c.pass ? 'OK' : 'FAIL'} ${c.name}`)
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
