import { render as wolfieRender } from '../index'
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
	theme?: any
}

export function render(component: any, options: RenderOptions = {}): any {
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
		theme: options.theme,
		incrementalRendering: false,
	})

	const handle = { unmount: () => rawInstance.unmount() }
	registerInstance(handle)

	return {
		rerender: (newComp: any) => rawInstance.render(newComp),
		unmount: () => {
			unregisterInstance(handle)
			rawInstance.unmount()
		},
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
