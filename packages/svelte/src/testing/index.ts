import { render as wolfieRender } from '../index'
import {
	MockStdout,
	MockStderr,
	MockStdin,
	KEYS,
	delay,
	stripAnsi,
} from '@wolf-tui/testing-library'

export { KEYS, delay, stripAnsi }

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

	return {
		rerender: (newComp: any) => rawInstance.render(newComp),
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
