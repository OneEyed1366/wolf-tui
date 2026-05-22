import { describe, it, expect } from 'vitest'
import { MockStdout, MockStderr, MockStdin } from '../src/core/index.js'

describe('Core Stream Mocks', () => {
	it('captures write frames on stdout and stderr', () => {
		const stdout = new MockStdout()
		const stderr = new MockStderr()

		stdout.write('hello stdout')
		stderr.write('hello stderr')

		expect(stdout.frames).toEqual(['hello stdout'])
		expect(stdout.lastFrame()).toBe('hello stdout')
		expect(stderr.frames).toEqual(['hello stderr'])
		expect(stderr.lastFrame()).toBe('hello stderr')

		stdout.clear()
		expect(stdout.frames).toEqual([])
		expect(stdout.lastFrame()).toBeUndefined()
	})

	it('emits readable and data events on stdin and queues read buffer', async () => {
		const stdout = new MockStdout()
		const stdin = new MockStdin(stdout)

		let readableFired = false
		let dataFiredWith: Buffer | null = null

		stdin.on('readable', () => {
			readableFired = true
		})

		stdin.on('data', (buf) => {
			dataFiredWith = buf
		})

		// Write should trigger stdout write or safety timeout
		const p = stdin.write('a')

		// Simulate framework writing to stdout in response to keypress
		stdout.write('render-tick')

		await p

		expect(readableFired).toBe(true)
		expect(dataFiredWith).not.toBeNull()
		expect(dataFiredWith!.toString()).toBe('a')
		expect(stdin.read()).toBe('a')
		expect(stdin.read()).toBeNull()
	})
})
