'use strict'

// WHY: Re-spawn with --conditions=browser so Node 22's require(esm) picks
// svelte's browser export (index-client.js with mount()) instead of the
// default server export (index-server.js which throws on mount()).
if (!process.env.WOLFIE_SVELTE_CONDITIONS) {
	process.env.WOLFIE_SVELTE_CONDITIONS = '1'
	const { spawnSync } = require('child_process')
	const result = spawnSync(
		process.execPath,
		['--conditions=browser', __filename],
		{ stdio: 'inherit', env: process.env }
	)
	process.exit(result.status ?? 0)
}

const log = (msg) => process.stderr.write(msg + '\n')
const { EventEmitter } = require('events')

let frames = []
const fakeStdout = Object.assign(new EventEmitter(), {
	isTTY: false,
	columns: 80,
	rows: 24,
	write: (data) => {
		frames.push(String(data))
		return true
	},
})

const fakeStdin = Object.assign(new EventEmitter(), {
	isTTY: false,
	setRawMode: () => {},
	// WHY: Svelte stdin uses data events (same as Vue/Solid, not React's readable+read)
	read: () => null,
})

//#region Swap process streams before render starts
const origStdout = process.stdout
const origStdin = process.stdin
Object.defineProperty(process, 'stdout', {
	get: () => fakeStdout,
	configurable: true,
})
Object.defineProperty(process, 'stdin', {
	get: () => fakeStdin,
	configurable: true,
})
//#endregion Swap process streams

// WHY: require AFTER stream swap — render(App) inside the bundle reads process.stdout/stdin
require('./dist/index.cjs')

const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
let passed = 0
let failed = 0

function check(label, actual, expected) {
	if (actual === expected) {
		log(`✔ ${label}`)
		passed++
	} else {
		log(
			`✗ ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
		)
		failed++
	}
}

// Test 1 & 2 — initial render: header + first tab active
setTimeout(() => {
	const plain0 = stripAnsi(frames.join(''))
	check(
		'Header shows "Wolfie Svelte Comprehensive Demo"',
		plain0.includes('Wolfie Svelte Comprehensive Demo'),
		true
	)
	check('First tab [1] Styles visible', plain0.includes('[1] Styles'), true)

	// Test 3 — Tab key switches to Runes screen
	frames = []
	fakeStdin.emit('data', Buffer.from('\t')) // Tab

	setTimeout(() => {
		const plain1 = stripAnsi(frames.join(''))
		check(
			'Tab switches to [2] Runes screen',
			plain1.includes('[2] Runes') && plain1.includes('$state'),
			true
		)

		// Test 4 — number key '3' jumps to Input screen
		frames = []
		fakeStdin.emit('data', Buffer.from('3'))

		setTimeout(() => {
			const plain2 = stripAnsi(frames.join(''))
			check(
				'Key "3" jumps to Input screen',
				plain2.includes('Type anything'),
				true
			)

			log(`\nverify.cjs: ${passed} passed, ${failed} failed`)
			Object.defineProperty(process, 'stdout', {
				get: () => origStdout,
				configurable: true,
			})
			Object.defineProperty(process, 'stdin', {
				get: () => origStdin,
				configurable: true,
			})
			process.exit(failed > 0 ? 1 : 0)
		}, 200)
	}, 200)
}, 100)
