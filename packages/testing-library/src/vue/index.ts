import { render as wolfieRender } from '@wolf-tui/vue'
import { MockStdout, MockStderr, MockStdin } from '../core/index.js'

export interface RenderOptions {
	columns?: number
	rows?: number
}

export function render(component: any, options: RenderOptions = {}) {
	const stdout = new MockStdout(options.columns, options.rows)
	const stderr = new MockStderr()
	const stdin = new MockStdin(stdout)

	const rawInstance = wolfieRender(component, {
		stdout: stdout as any,
		stderr: stderr as any,
		stdin: stdin as any,
		debug: false,
		maxFps: 30,
		exitOnCtrlC: false,
	})

	return {
		rerender: (newComponent: any) => rawInstance.render(newComponent),
		unmount: () => rawInstance.unmount(),
		cleanup: () => {},
		clear: () => {},
		get frames() {
			return stdout.frames
		},
		lastFrame: () => stdout.lastFrame(),
		stdin,
		stdout,
		stderr,
		rawInstance: rawInstance as any,
	}
}
