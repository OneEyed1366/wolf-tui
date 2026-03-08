// examples/angular_invaders/verify.cjs
// Headless render harness for visual verification
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

async function verify() {
	const { AppComponent } = require('./dist/index.cjs')
	const { renderWolfie } = require('@wolfie/angular')
	const { NgZone } = require('@angular/core')
	const stripAnsiMod = require('strip-ansi')
	const stripAnsi = stripAnsiMod.default ?? stripAnsiMod

	const stdout = createFakeStream(80, 24)
	const stdin = createFakeStdin()
	const stderr = createFakeStream(80, 24)

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

	console.log('=== MENU SCREEN (80x24) ===')
	console.log(stripAnsi(stdout.get()))

	// Navigate to Help: Down×3, Enter
	for (let i = 0; i < 3; i++) stdin.emit('data', '\x1b[B')
	stdin.emit('data', '\r')
	await delay(300)
	console.log('\n=== HELP SCREEN ===')
	console.log(stripAnsi(stdout.get()))

	// Back to menu: Esc
	stdin.emit('data', '\x1b')
	await delay(300)

	// Navigate to Settings: Down×2, Enter
	for (let i = 0; i < 2; i++) stdin.emit('data', '\x1b[B')
	stdin.emit('data', '\r')
	await delay(300)
	console.log('\n=== SETTINGS SCREEN ===')
	console.log(stripAnsi(stdout.get()))

	// Back to menu: Esc
	stdin.emit('data', '\x1b')
	await delay(300)

	// Navigate to High Scores: Down×1, Enter
	for (let i = 0; i < 1; i++) stdin.emit('data', '\x1b[B')
	stdin.emit('data', '\r')
	await delay(300)
	console.log('\n=== HIGH SCORES SCREEN ===')
	console.log(stripAnsi(stdout.get()))

	// Back to menu: Esc
	stdin.emit('data', '\x1b')
	await delay(300)

	// Start Game: "Start Game" is first option, press Enter
	stdin.emit('data', '\x1b[A') // Up to wrap to Start Game
	stdin.emit('data', '\x1b[A')
	stdin.emit('data', '\x1b[A')
	stdin.emit('data', '\x1b[A')
	stdin.emit('data', '\r')
	await delay(500)
	console.log('\n=== GAME SCREEN (initial) ===')
	const gameFrame = stripAnsi(stdout.get())
	console.log(gameFrame)

	// Verify game content
	const hasPlayer = gameFrame.includes('^')
	const hasHud = gameFrame.includes('SCORE')
	// Check for specific alien sprite characters (not ^, which is also player)
	const alienChars = gameFrame.match(/[VAWMNXKY]/g)
	console.log('\n--- Game Verification ---')
	console.log(
		'Has alien sprites:',
		alienChars ? alienChars.length : 0,
		alienChars ? alienChars.slice(0, 20) : []
	)
	console.log('Has player sprite:', hasPlayer)
	console.log('Has HUD:', hasHud)

	// Debug: check each line for non-space content
	const lines = gameFrame.split('\n')
	console.log('Total lines:', lines.length)
	lines.forEach((line, i) => {
		const nonSpaceChars = line.replace(/ /g, '')
		if (nonSpaceChars.length > 0) {
			console.log(
				`  Line ${i} (len=${line.length}): non-space="${nonSpaceChars.substring(0, 60)}"`
			)
		}
	})

	// Check frame count and look for aliens in ALL frames
	const totalFrames = stdout.frameCount()
	console.log('Total stdout frames written:', totalFrames)
	let maxAliens = 0
	let bestFrame = -1
	for (let i = 0; i < totalFrames; i++) {
		const frame = stdout.getFrame(i)
		const clean = frame.replace(/\x1b\[[^a-zA-Z]*[a-zA-Z]/g, '')
		// Look for alien sprite patterns: V/A/^ followed by spaces (avoid matching LIVES/WAVE text)
		const alienCount = (clean.match(/(?<![A-Z])[VAWNMXKY](?![A-Z])/g) || [])
			.length
		if (alienCount > maxAliens) {
			maxAliens = alienCount
			bestFrame = i
		}
	}
	console.log(
		'Max alien chars in any frame:',
		maxAliens,
		'at frame:',
		bestFrame
	)
	if (bestFrame >= 0) {
		const bf = stripAnsi(stdout.getFrame(bestFrame))
		const bfLines = bf.split('\n')
		bfLines.forEach((line, i) => {
			const ns = line.replace(/ /g, '')
			if (ns.length > 0 && i > 0 && i < bfLines.length - 3) {
				console.log(`  Best frame line ${i}: "${line.substring(0, 80)}"`)
			}
		})
	}

	instance.unmount()
	process.exit(0)
}

verify().catch((e) => {
	console.error('Verify failed:', e)
	process.exit(1)
})
