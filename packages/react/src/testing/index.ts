import wolfieRender from '../render'
import {
	MockStdout,
	MockStderr,
	MockStdin,
	KEYS,
	delay,
	stripAnsi,
	cleanup,
	registerInstance,
	unregisterInstance,
} from '@wolf-tui/testing-library'

export { KEYS, delay, stripAnsi, cleanup }

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

	const handle = {
		unmount: () => rawInstance.unmount(),
		cleanup: () => rawInstance.cleanup(),
	}
	registerInstance(handle)

	return {
		rerender: (newNode: any) => rawInstance.rerender(newNode),
		unmount: () => {
			unregisterInstance(handle)
			rawInstance.unmount()
		},
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
