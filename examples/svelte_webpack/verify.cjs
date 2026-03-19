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

// WHY: must set before import so the app skips real TTY mounting
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
	const { App } = await import('./dist/index.js')
	const { render } = await import('@wolfie/svelte')

	const stdout = createFakeStream(120, 40)
	const stdin = createFakeStdin()
	const stderr = createFakeStream(120, 40)

	const delay = (ms) => new Promise((r) => setTimeout(r, ms))
	const send = (key) => stdin._send(key)

	const TAB = '\t'

	// WHY: debug: false with maxFps: 30 prevents event loop starvation
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

	let failed = 0

	// Check 1: Title visible
	const frame0 = stripAnsi(stdout.get())
	if (frame0.includes('Comprehensive Demo')) {
		console.log('✔ Title visible (Comprehensive Demo)')
	} else {
		console.error('FAIL: title not found\n', frame0.slice(0, 500))
		failed++
	}

	// Check 2: Tab bar visible with screen names
	if (
		frame0.includes('Styles') &&
		frame0.includes('Inputs') &&
		frame0.includes('Status')
	) {
		console.log('✔ Tab bar rendered (Styles, Inputs, Status)')
	} else {
		console.error('FAIL: tab bar missing\n', frame0.slice(0, 500))
		failed++
	}

	// Check 3: Styles screen visible on initial load (Tailwind section)
	if (frame0.includes('Tailwind')) {
		console.log('✔ Styles screen visible (Tailwind section)')
	} else {
		console.error('FAIL: Styles screen not visible\n', frame0.slice(0, 500))
		failed++
	}

	// Check 4: Tab to next screen (Inputs)
	send(TAB)
	await delay(200)
	const frame1 = stripAnsi(stdout.get())
	if (frame1.includes('Text Inputs') || frame1.includes('Name:')) {
		console.log('✔ Tab navigated to Inputs screen')
	} else {
		console.error(
			'FAIL: Inputs screen not visible after tab\n',
			frame1.slice(0, 500)
		)
		failed++
	}

	// Check 5: Jump to Status screen (press 4)
	send('4')
	await delay(200)
	const frame4 = stripAnsi(stdout.get())
	if (
		frame4.includes('Alerts') ||
		frame4.includes('Badges') ||
		frame4.includes('Spinner')
	) {
		console.log('✔ Jump to Status screen (key 4)')
	} else {
		console.error(
			'FAIL: Status screen not visible after key 4\n',
			frame4.slice(0, 500)
		)
		failed++
	}

	// Check 6: Jump to Lists screen (press 5)
	send('5')
	await delay(200)
	const frame5 = stripAnsi(stdout.get())
	if (frame5.includes('Ordered List') || frame5.includes('Unordered List')) {
		console.log('✔ Jump to Lists screen (key 5)')
	} else {
		console.error(
			'FAIL: Lists screen not visible after key 5\n',
			frame5.slice(0, 500)
		)
		failed++
	}

	// Check 7: Jump to Errors screen (press 6)
	send('6')
	await delay(200)
	const frame6 = stripAnsi(stdout.get())
	if (frame6.includes('Error Overview') || frame6.includes('Failed to fetch')) {
		console.log('✔ Jump to Errors screen (key 6)')
	} else {
		console.error(
			'FAIL: Errors screen not visible after key 6\n',
			frame6.slice(0, 500)
		)
		failed++
	}

	// Check 8: Footer visible
	if (frame0.includes('q quit')) {
		console.log('✔ Footer visible (q quit)')
	} else {
		console.error('FAIL: footer not found\n', frame0.slice(0, 500))
		failed++
	}

	console.log(
		failed === 0
			? '✔ verify.cjs: all checks passed'
			: `✘ verify.cjs: ${failed} check(s) failed`,
		'(frames:',
		stdout.frameCount() + ')'
	)
	instance.unmount()
	process.exit(failed > 0 ? 1 : 0)
}

verify().catch((e) => {
	console.error('FAIL:', e)
	process.exit(1)
})
