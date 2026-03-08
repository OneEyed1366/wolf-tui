// examples/vue_invaders/verify.cjs
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
	// WHY: Vue uses data events (unlike React's readable+read pattern)
	ee._send = (key) => ee.emit('data', Buffer.from(key))
	return ee
}
//#endregion Fake Streams

async function verify() {
	const { App } = await import('./dist/index.js')
	const { render } = await import('@wolfie/vue')

	const stdout = createFakeStream(80, 24)
	const stdin = createFakeStdin()
	const stderr = createFakeStream(80, 24)

	const delay = (ms) => new Promise((r) => setTimeout(r, ms))

	// WHY: debug: true floods event loop during game tick (starves setTimeout)
	const instance = render(App, {
		stdout,
		stdin,
		stderr,
		debug: false,
		maxFps: 30,
		incrementalRendering: false,
	})

	await delay(200)

	const { default: stripAnsiMod } = await import('strip-ansi')
	const stripAnsi =
		typeof stripAnsiMod === 'function' ? stripAnsiMod : stripAnsiMod.default

	const send = (key) => stdin._send(key)
	const DOWN = '\x1b[B'
	const UP = '\x1b[A'
	const ENTER = '\r'
	const ESC = '\x1b'

	console.log('=== MENU SCREEN (80x24) ===')
	console.log(stripAnsi(stdout.get()))
	;[DOWN, DOWN, DOWN, ENTER].forEach(send)
	await delay(200)
	console.log('\n=== HELP SCREEN ===')
	console.log(stripAnsi(stdout.get()))

	send(ESC)
	await delay(200)
	;[DOWN, DOWN, ENTER].forEach(send)
	await delay(200)
	console.log('\n=== SETTINGS SCREEN ===')
	console.log(stripAnsi(stdout.get()))

	send(ESC)
	await delay(200)
	;[DOWN, ENTER].forEach(send)
	await delay(200)
	console.log('\n=== HIGH SCORES SCREEN ===')
	console.log(stripAnsi(stdout.get()))

	send(ESC)
	await delay(200)
	;[UP, UP, UP, UP, ENTER].forEach(send)
	await delay(400)
	console.log('\n=== GAME SCREEN ===')
	const gameFrame = stripAnsi(stdout.get())
	console.log(gameFrame)

	console.log('\n--- Verification ---')
	console.log('Has player (^):', gameFrame.includes('^'))
	console.log('Has HUD (SCORE):', gameFrame.includes('SCORE'))
	console.log('Total frames:', stdout.frameCount())

	instance.unmount?.()
	process.exit(0)
}

verify().catch((e) => {
	console.error('Verify failed:', e)
	process.exit(1)
})
