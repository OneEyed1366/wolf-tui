import { EventEmitter } from 'events'
import { createRequire } from 'module'
import { resolve } from 'path'
import { fork } from 'child_process'
import { createInterface } from 'readline'

//#region Types
type Framework = 'react' | 'vue' | 'angular' | 'solid' | 'svelte'

interface FakeStdout extends EventEmitter {
	columns: number
	rows: number
	write: (data: string) => boolean
	get: () => string
	getAll: () => string[]
	frameCount: () => number
	getFrame: (i: number) => string
}

interface FakeStdin extends EventEmitter {
	isTTY: boolean
	setRawMode: () => void
	setEncoding: () => void
	read: () => string | null
	unref: () => void
	ref: () => void
	push: (chunk: string) => void
}

export interface AppInstance {
	sendKey: (key: string) => void
	sendKeys: (keys: string[], delayMs?: number) => Promise<void>
	getFrame: () => string
	getAllFrames: () => string[]
	frameCount: () => number
	delay: (ms: number) => Promise<void>
	unmount: () => void
	stdout: FakeStdout
}
//#endregion Types

//#region Fake Streams
export function createFakeStdout(cols = 80, rows = 24): FakeStdout {
	const ee = new EventEmitter() as FakeStdout
	ee.columns = cols
	ee.rows = rows
	const frames: string[] = []
	ee.write = (data: string) => {
		frames.push(data)
		return true
	}
	ee.get = () => frames[frames.length - 1] ?? ''
	ee.getAll = () => [...frames]
	ee.frameCount = () => frames.length
	ee.getFrame = (i: number) => frames[i] ?? ''
	return ee
}

export function createFakeStdin(): FakeStdin {
	const ee = new EventEmitter() as FakeStdin
	const buffer: string[] = []
	ee.isTTY = true
	ee.setRawMode = () => {}
	ee.setEncoding = () => {}
	ee.read = () => buffer.shift() ?? null
	ee.unref = () => {}
	ee.ref = () => {}
	ee.push = (chunk: string) => {
		buffer.push(chunk)
		ee.emit('readable')
		ee.emit('data', chunk)
	}
	return ee
}
//#endregion Fake Streams

//#region App Launcher
const ROOT = resolve(__dirname, '../..')

export async function createApp(
	framework: Framework,
	options: { cols?: number; rows?: number } = {}
): Promise<AppInstance> {
	const { cols = 80, rows = 24 } = options
	const stdout = createFakeStdout(cols, rows)
	const stdin = createFakeStdin()
	const stderr = createFakeStdout(cols, rows)

	// Set env BEFORE import/require
	process.env['WOLFIE_VERIFY'] = '1'

	let unmountFn: () => void

	switch (framework) {
		case 'react': {
			const bundlePath = resolve(ROOT, 'examples/react_invaders/dist/index.js')
			const { App } = await import(bundlePath)
			const React = await import('react')
			const { render } = await import('@wolfie/react')
			const element = React.createElement(App)
			const instance = render(element, {
				stdout: stdout as unknown as NodeJS.WriteStream,
				stdin: stdin as unknown as NodeJS.ReadStream,
				stderr: stderr as unknown as NodeJS.WriteStream,
				debug: true,
				exitOnCtrlC: false,
			})
			unmountFn = () => instance.unmount()
			break
		}
		case 'vue': {
			const bundlePath = resolve(ROOT, 'examples/vue_invaders/dist/index.js')
			const { App } = await import(bundlePath)
			const { render } = await import('@wolfie/vue')
			const instance = render(App, {
				stdout: stdout as unknown as NodeJS.WriteStream,
				stdin: stdin as unknown as NodeJS.ReadStream,
				stderr: stderr as unknown as NodeJS.WriteStream,
				debug: false,
				maxFps: 30,
				incrementalRendering: false,
			})
			unmountFn = () => instance.unmount()
			break
		}
		case 'angular': {
			const esmRequire = createRequire(import.meta.url)
			const bundlePath = resolve(
				ROOT,
				'examples/angular_invaders/dist/index.cjs'
			)
			const { AppComponent } = esmRequire(bundlePath)
			const { renderWolfie } = esmRequire('@wolfie/angular')
			// debug: false + maxFps: 30 — same as Vue; debug: true floods
			// event loop during game ticks, starving setTimeout in tests
			const instance = await renderWolfie(AppComponent, {
				stdout,
				stdin,
				stderr,
				debug: false,
				maxFps: 30,
				exitOnCtrlC: false,
				incrementalRendering: false,
			})
			unmountFn = () => instance.unmount()
			break
		}
		case 'solid': {
			const bundlePath = resolve(ROOT, 'examples/solid_invaders/dist/index.js')
			const { App } = await import(bundlePath)
			const { render } = await import('@wolfie/solid')
			// debug: false + maxFps: 30 — same as Vue; solid uses data events
			const instance = render(App, {
				stdout: stdout as unknown as NodeJS.WriteStream,
				stdin: stdin as unknown as NodeJS.ReadStream,
				stderr: stderr as unknown as NodeJS.WriteStream,
				debug: false,
				maxFps: 30,
				incrementalRendering: false,
			})
			unmountFn = () => instance.unmount()
			break
		}
		case 'svelte': {
			// Svelte requires --conditions=browser so Node resolves svelte to client build.
			// Vitest's transform pipeline doesn't propagate export conditions, so we
			// spawn a separate Node process with the flag and communicate via IPC.
			const loaderPath = resolve(__dirname, 'svelte-loader.mjs')
			const child = fork(loaderPath, [JSON.stringify({ cols, rows })], {
				execArgv: ['--conditions=browser'],
				stdio: ['pipe', 'pipe', 'inherit', 'ipc'],
			})

			// Wait for 'ready' signal from loader
			const rl = createInterface({ input: child.stdout! })
			let lastFrame = ''
			const allFrames: string[] = []
			const frameCounter = 0

			const sendCmd = (
				cmd: Record<string, unknown>
			): Promise<Record<string, unknown>> => {
				return new Promise((resolve) => {
					const handler = (line: string) => {
						try {
							const resp = JSON.parse(line)
							rl.off('line', handler)
							resolve(resp)
						} catch {
							/* skip non-JSON lines */
						}
					}
					rl.on('line', handler)
					child.stdin!.write(JSON.stringify(cmd) + '\n')
				})
			}

			// Wait for ready
			await new Promise<void>((resolve) => {
				const handler = (line: string) => {
					try {
						const resp = JSON.parse(line)
						if (resp.ready) {
							rl.off('line', handler)
							resolve()
						}
					} catch {
						/* skip non-JSON lines */
					}
				}
				rl.on('line', handler)
			})

			// Bridge: translate AppInstance methods to IPC commands
			const svelteStdout = createFakeStdout(cols, rows)

			const refreshFrame = async () => {
				const resp = await sendCmd({ type: 'getFrame' })
				if (resp.frame) {
					lastFrame = resp.frame as string
					svelteStdout.write(lastFrame)
				}
			}

			// Initial frame
			await refreshFrame()

			unmountFn = () => {
				child.stdin!.write(JSON.stringify({ type: 'unmount' }) + '\n')
				setTimeout(() => child.kill(), 500)
			}

			// Override return to use IPC-based methods
			const svelteDelay = (ms: number) =>
				new Promise<void>((r) => setTimeout(r, ms))
			return {
				sendKey: (key: string) => {
					child.stdin!.write(JSON.stringify({ type: 'sendKey', key }) + '\n')
				},
				sendKeys: async (keys: string[], delayMs = 100) => {
					for (const key of keys) {
						child.stdin!.write(JSON.stringify({ type: 'sendKey', key }) + '\n')
						await svelteDelay(delayMs)
					}
				},
				getFrame: () => {
					// Sync read — return last known frame.
					// Tests should call delay() before getFrame() to allow rendering.
					return lastFrame
				},
				getAllFrames: () => allFrames,
				frameCount: () => frameCounter,
				delay: async (ms: number) => {
					await svelteDelay(ms)
					await refreshFrame()
				},
				unmount: unmountFn,
				stdout: svelteStdout,
			}
		}
	}

	const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

	return {
		sendKey: (key: string) => stdin.push(key),
		sendKeys: async (keys: string[], delayMs = 100) => {
			for (const key of keys) {
				stdin.push(key)
				await delay(delayMs)
			}
		},
		getFrame: () => stdout.get(),
		getAllFrames: () => stdout.getAll(),
		frameCount: () => stdout.frameCount(),
		delay,
		unmount: unmountFn!,
		stdout,
	}
}
//#endregion App Launcher
