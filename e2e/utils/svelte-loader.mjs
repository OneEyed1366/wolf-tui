// Helper script to load @wolfie/svelte app in a subprocess with --conditions=browser.
// Vitest's forks pool doesn't propagate export conditions to Node's ESM loader,
// so we spawn a separate Node process that creates the app and communicates via IPC.
//
// This script is spawned by the harness with --conditions=browser.
// It receives commands (sendKey, getFrame, unmount) over stdin and responds on stdout.

import { EventEmitter } from 'events'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')

process.env.WOLFIE_VERIFY = '1'

const args = JSON.parse(process.argv[2])
const { cols, rows } = args

// Create fake streams
function createFakeStdout(c, r) {
	const ee = new EventEmitter()
	ee.columns = c
	ee.rows = r
	const frames = []
	ee.write = (data) => {
		frames.push(data)
		return true
	}
	ee.get = () => frames[frames.length - 1] ?? ''
	ee.getAll = () => [...frames]
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
	ee.push = (chunk) => {
		ee.emit('readable')
		ee.emit('data', chunk)
	}
	return ee
}

const stdout = createFakeStdout(cols, rows)
const stdin = createFakeStdin()
const stderr = createFakeStdout(cols, rows)

const bundlePath = resolve(ROOT, 'examples/svelte_invaders/dist/index.js')
const { App } = await import(bundlePath)
const { render } = await import('@wolfie/svelte')

const instance = render(App, {
	stdout,
	stdin,
	stderr,
	debug: false,
	maxFps: 30,
	incrementalRendering: false,
})

// IPC: read commands from stdin, write responses to stdout
process.stdin.setEncoding('utf8')
let inputBuffer = ''
process.stdin.on('data', (chunk) => {
	inputBuffer += chunk
	const lines = inputBuffer.split('\n')
	inputBuffer = lines.pop()
	for (const line of lines) {
		if (!line.trim()) continue
		try {
			const cmd = JSON.parse(line)
			handleCommand(cmd)
		} catch {
			/* ignore parse errors */
		}
	}
})

function handleCommand(cmd) {
	switch (cmd.type) {
		case 'sendKey':
			stdin.push(cmd.key)
			respond({ ok: true })
			break
		case 'getFrame':
			respond({ frame: stdout.get() })
			break
		case 'getAllFrames':
			respond({ frames: stdout.getAll() })
			break
		case 'frameCount':
			respond({ count: stdout.frameCount() })
			break
		case 'unmount':
			instance.unmount()
			respond({ ok: true })
			setTimeout(() => process.exit(0), 100)
			break
		default:
			respond({ error: `Unknown command: ${cmd.type}` })
	}
}

function respond(data) {
	process.stdout.write(JSON.stringify(data) + '\n')
}

// Signal readiness
respond({ ready: true })
