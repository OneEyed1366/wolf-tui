'use strict'

// Svelte needs --conditions=browser so Node resolves to browser export (mount()).
// Self-respawn with the flag, then continue in the child process.
if (!process.env.WOLFIE_SVELTE_CONDITIONS) {
	const { execFileSync } = require('child_process')
	try {
		execFileSync(process.execPath, ['--conditions=browser', __filename], {
			stdio: 'inherit',
			env: { ...process.env, WOLFIE_SVELTE_CONDITIONS: '1' },
		})
	} catch (e) {
		process.exit(e.status ?? 1)
	}
	process.exit(0)
}

// Must set before import so showcase skips real TTY mounting
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
	return ee
}

function createFakeStdin() {
	const ee = new EventEmitter()
	ee.isTTY = true
	ee.setRawMode = () => {}
	ee.setEncoding = () => {}
	ee.unref = () => {}
	ee.ref = () => {}
	// Svelte uses data events (same as Vue/Solid, NOT React's readable+read pattern)
	ee._send = (key) => ee.emit('data', Buffer.from(key))
	return ee
}
//#endregion Fake Streams

//#region Helpers
const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const DOWN = '\x1b[B'
const UP = '\x1b[A'
const ENTER = '\r'
const ESC = '\x1b'
//#endregion Helpers

async function verify() {
	const { App } = await import('./dist/index.js')
	const { render } = await import('@wolf-tui/svelte')
	const { default: stripAnsiMod } = await import('strip-ansi')
	const stripAnsi =
		typeof stripAnsiMod === 'function' ? stripAnsiMod : stripAnsiMod.default

	const stdout = createFakeStream(80, 30)
	const stdin = createFakeStdin()
	const stderr = createFakeStream(80, 30)
	const send = (key) => stdin._send(key)

	// debug: false with maxFps: 30 prevents event loop starvation
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
		await delay(500)
	}

	//#region Timer
	console.log('--- Timer ---')
	await openDemo(0)
	let timerFrame = stripAnsi(stdout.get())
	console.log(timerFrame)
	const hasTimer = timerFrame.includes('Timer Demo')
	checks.push({ name: 'Timer renders', pass: hasTimer })
	console.log('Timer renders:', hasTimer ? '✅' : '❌')

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
	console.log('TreeView renders:', hasTree ? '✅' : '❌')

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
	console.log('Combobox renders:', hasCombo ? '✅' : '❌')

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
	console.log('JsonViewer renders:', hasJson ? '✅' : '❌')

	send(ESC)
	await delay(300)
	//#endregion JsonViewer

	//#region FilePicker
	console.log('\n--- FilePicker ---')
	await openDemo(4)
	await delay(500)
	const fileFrame = stripAnsi(stdout.get())
	console.log(fileFrame)
	const hasFile = fileFrame.includes('FilePicker Demo')
	checks.push({ name: 'FilePicker renders', pass: hasFile })
	console.log('FilePicker renders:', hasFile ? '✅' : '❌')

	send(ESC)
	await delay(300)
	//#endregion FilePicker

	//#region Gradient
	console.log('\n--- Gradient ---')
	await openDemo(5)
	const gradFrameStripped = stripAnsi(stdout.get())
	const gradFrameRaw = stdout.get()
	console.log(gradFrameStripped)
	const hasGrad = gradFrameStripped.includes('Gradient Demo')
	const hasColors = /\x1b\[(?:38;[25];\d+(?:;\d+;\d+)?|3[0-7]|9[0-7])m/.test(
		gradFrameRaw
	)
	checks.push({ name: 'Gradient renders', pass: hasGrad })
	checks.push({ name: 'Gradient emits ANSI colors', pass: hasColors })
	console.log('Gradient renders:', hasGrad ? '✅' : '❌')
	console.log('Gradient colors:', hasColors ? '✅' : '❌')
	//#endregion Gradient

	//#region Summary
	console.log('\n=== SUMMARY ===')
	const passed = checks.filter((c) => c.pass).length
	const total = checks.length
	for (const c of checks) {
		const suffix = c.skipped ? ' (SKIPPED - known bug)' : ''
		console.log(`  ${c.pass ? '✅' : '❌'} ${c.name}${suffix}`)
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
