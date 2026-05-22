import { EventEmitter } from 'node:events'
import type { MockStdout } from './stdout.js'

export interface MockStdinOptions {
	isTTY?: boolean
}

export class MockStdin extends EventEmitter {
	public readonly isTTY: boolean
	private buffer: string[] = []
	private stdout: MockStdout
	private rawModeEnabled = false

	constructor(stdout: MockStdout, options: MockStdinOptions = {}) {
		super()
		this.stdout = stdout
		this.isTTY = options.isTTY ?? true
	}

	setRawMode(value: boolean): void {
		this.rawModeEnabled = value
	}

	setEncoding(): void {}
	ref(): void {}
	unref(): void {}
	resume(): void {}
	pause(): void {}

	read(): string | null {
		return this.buffer.shift() ?? null
	}

	async write(data: string | Buffer): Promise<void> {
		const chunk = data.toString()
		this.buffer.push(chunk)

		const framePromise = new Promise<void>((resolve) => {
			this.stdout.once('write', () => resolve())
			// Safety timeout in case key press does not trigger visual update
			setTimeout(resolve, 50)
		})

		this.emit('readable')
		this.emit('data', Buffer.from(chunk))

		await framePromise
	}
}
