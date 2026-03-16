'use strict'

// WHY: Svelte needs --conditions=browser so Node resolves to browser export (mount()).
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

// WHY: must set before import so svelte-invaders skips real TTY mounting
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
	// WHY: Svelte uses data events (same as Vue/Solid, NOT React's readable+read pattern)
	ee._send = (key) => ee.emit('data', Buffer.from(key))
	return ee
}
//#endregion Fake Streams

async function verify() {
	// WHY: dynamic import bc svelte-invaders builds to ES module format (formats: ['es'])
	const { App } = await import('./dist/index.js')
	const { render } = await import('@wolfie/svelte')

	const stdout = createFakeStream(120, 40)
	const stdin = createFakeStdin()
	const stderr = createFakeStream(120, 40)

	const delay = (ms) => new Promise((r) => setTimeout(r, ms))
	const send = (key) => stdin._send(key)

	const DOWN = '\x1b[B'
	const ENTER = '\r'
	const ESC = '\x1b'

	// WHY: debug: false with maxFps: 30 prevents event loop starvation during game tick
	const instance = render(App, {
		stdout,
		stdin,
		stderr,
		debug: false,
		maxFps: 30,
		incrementalRendering: false,
	})

	await delay(300)

	const { default: stripAnsiMod } = await import('strip-ansi')
	const stripAnsi =
		typeof stripAnsiMod === 'function' ? stripAnsiMod : stripAnsiMod.default

	const menuFrame = stripAnsi(stdout.get())

	// Menu should render the logo + menu options
	if (!menuFrame.includes('Start Game')) {
		console.error('FAIL: menu did not render\n', menuFrame.slice(0, 500))
		process.exit(1)
	}
	console.log('✔ Menu screen rendered (Start Game visible)')

	// Navigate to Help: DOWN x3 (Start→High Scores→Settings→Help), then ENTER
	send(DOWN)
	await delay(150)
	send(DOWN)
	await delay(150)
	send(DOWN)
	await delay(150)
	send(ENTER)
	await delay(500)

	const helpFrame = stripAnsi(stdout.get())
	if (!helpFrame.includes('HELP') && !helpFrame.includes('Controls')) {
		console.error('FAIL: help screen did not render\n', helpFrame.slice(0, 500))
		process.exit(1)
	}
	console.log('✔ Help screen rendered (Controls visible)')

	// ESC back to menu
	send(ESC)
	await delay(200)

	const backFrame = stripAnsi(stdout.get())
	if (!backFrame.includes('Start Game')) {
		console.error(
			'FAIL: did not return to menu after ESC\n',
			backFrame.slice(0, 500)
		)
		process.exit(1)
	}
	console.log('✔ ESC returns to menu')

	// Navigate to High Scores: DOWN x1, ENTER
	send(DOWN)
	await delay(150)
	send(ENTER)
	await delay(200)
	send(ESC)
	await delay(200)

	// Navigate to Settings: DOWN x2, ENTER
	send(DOWN)
	await delay(150)
	send(DOWN)
	await delay(150)
	send(ENTER)
	await delay(200)
	send(ESC)
	await delay(200)

	console.log(
		'✔ verify.cjs: all checks passed (frames:',
		stdout.frameCount() + ')'
	)
	instance.unmount()
	process.exit(0)
}

verify().catch((e) => {
	console.error('FAIL:', e)
	process.exit(1)
})
