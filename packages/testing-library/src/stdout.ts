import { EventEmitter } from 'node:events'

export class MockStdout extends EventEmitter {
	public readonly isTTY = true
	public columns: number
	public rows: number
	public frames: string[] = []

	constructor(columns = 80, rows = 24) {
		super()
		this.columns = columns
		this.rows = rows
	}

	write(data: string | Buffer): boolean {
		const frame = data.toString()
		// Filter out standard cursor visibility escape sequences
		if (frame === '\u001b[?25l' || frame === '\u001b[?25h') {
			return true
		}
		this.frames.push(frame)
		this.emit('write', frame)
		return true
	}

	lastFrame(): string | undefined {
		return this.frames[this.frames.length - 1]
	}

	get(): string {
		return this.lastFrame() ?? ''
	}

	frameCount(): number {
		return this.frames.length
	}

	getFrame(index: number): string {
		return this.frames[index] ?? ''
	}

	clear(): void {
		this.frames = []
	}
}
