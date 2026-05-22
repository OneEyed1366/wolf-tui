import { EventEmitter } from 'node:events'

export class MockStderr extends EventEmitter {
	public readonly isTTY = true
	public frames: string[] = []

	write(data: string | Buffer): boolean {
		const frame = data.toString()
		this.frames.push(frame)
		this.emit('write', frame)
		return true
	}

	lastFrame(): string | undefined {
		return this.frames[this.frames.length - 1]
	}

	clear(): void {
		this.frames = []
	}
}
