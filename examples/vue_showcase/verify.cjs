// examples/vue_showcase/verify.cjs
// Headless verification of all 5 community components (Vue adapter)
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
	// Vue uses data events (NOT React's readable+read pattern)
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
	const { render } = await import('@wolf-tui/vue')
	const { default: stripAnsiMod } = await import('strip-ansi')
	const stripAnsi =
		typeof stripAnsiMod === 'function' ? stripAnsiMod : stripAnsiMod.default

	const stdout = createFakeStream(80, 30)
	const stdin = createFakeStdin()
	const stderr = createFakeStream(80, 30)
	const send = (key) => stdin._send(key)

	// Vue: debug: false + maxFps: 30 (debug: true floods event loop)
	const instance = render(App, {
		stdout,
		stdin,
		stderr,
		debug: false,
		maxFps: 30,
		incrementalRendering: false,
	})

	await delay(300)
	const frame = stripAnsi(stdout.get())
	console.log('=== MENU ===')
	console.log(frame)
	console.log()

	const checks = []

	// Navigate menu to index N and press Enter
	async function openDemo(menuIndex) {
		// Go back to top
		for (let i = 0; i < 5; i++) send(UP)
		await delay(100)
		// Navigate down to target
		for (let i = 0; i < menuIndex; i++) {
			send(DOWN)
			await delay(100)
		}
		send(ENTER)
		await delay(500)
	}

	//#region Timer
	console.log('--- Timer ---')
	await openDemo(0)
	let timerFrame = stripAnsi(stdout.get())
	console.log(timerFrame)
	const hasTimer = timerFrame.includes('Timer Demo')
	checks.push({ name: 'Timer renders', pass: hasTimer })
	console.log('Timer renders:', hasTimer ? 'PASS' : 'FAIL')

	send(ESC)
	await delay(300)
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
	send(RIGHT)
	await delay(200)
	treeFrame = stripAnsi(stdout.get())
	const hasExpanded =
		treeFrame.includes('components') ||
		treeFrame.includes('utils') ||
		treeFrame.includes('index.ts')
	checks.push({ name: 'TreeView expand works', pass: hasExpanded })
	console.log('TreeView expand:', hasExpanded ? 'PASS' : 'FAIL')

	send(ESC)
	await delay(300)
	//#endregion TreeView

	//#region Combobox
	console.log('\n--- Combobox ---')
	await openDemo(2)
	let comboFrame = stripAnsi(stdout.get())
	console.log(comboFrame)
	const hasCombo = comboFrame.includes('Combobox Demo')
	checks.push({ name: 'Combobox renders', pass: hasCombo })
	console.log('Combobox renders:', hasCombo ? 'PASS' : 'FAIL')

	send(ESC)
	await delay(100)
	send(ESC) // double-Escape to exit Combobox demo
	await delay(300)
	//#endregion Combobox

	//#region JsonViewer
	console.log('\n--- JsonViewer ---')
	await openDemo(3)
	let jsonFrame = stripAnsi(stdout.get())
	console.log(jsonFrame)
	const hasJson = jsonFrame.includes('JsonViewer Demo')
	checks.push({ name: 'JsonViewer renders', pass: hasJson })
	console.log('JsonViewer renders:', hasJson ? 'PASS' : 'FAIL')

	send(ESC)
	await delay(300)
	//#endregion JsonViewer

	//#region FilePicker
	console.log('\n--- FilePicker ---')
	await openDemo(4)
	await delay(500) // extra time for directory read
	let fileFrame = stripAnsi(stdout.get())
	console.log(fileFrame)
	const hasFile = fileFrame.includes('FilePicker Demo')
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

	instance.unmount?.()
	process.exit(passed === total ? 0 : 1)
}

verify().catch((e) => {
	console.error('Verify failed:', e)
	process.exit(1)
})
