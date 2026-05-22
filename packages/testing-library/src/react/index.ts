import { render as wolfieRender } from '@wolf-tui/react'
import { MockStdout, MockStderr, MockStdin } from '../core/index.js'

export interface RenderOptions {
	columns?: number
	rows?: number
}

export function render(node: any, options: RenderOptions = {}) {
	const stdout = new MockStdout(options.columns, options.rows)
	const stderr = new MockStderr()
	const stdin = new MockStdin(stdout)

	const rawInstance = wolfieRender(node, {
		stdout: stdout as any,
		stderr: stderr as any,
		stdin: stdin as any,
		debug: true,
		exitOnCtrlC: false,
		patchConsole: false,
	})

	return {
		rerender: (newNode: any) => rawInstance.rerender(newNode),
		unmount: () => rawInstance.unmount(),
		cleanup: () => rawInstance.cleanup(),
		clear: () => rawInstance.clear(),
		get frames() {
			return stdout.frames
		},
		lastFrame: () => stdout.lastFrame(),
		stdin,
		stdout,
		stderr,
		rawInstance,
	}
}
