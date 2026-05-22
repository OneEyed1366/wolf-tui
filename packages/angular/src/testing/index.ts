import { renderWolfie } from '../bootstrap'
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
	providers?: any[]
}

export async function render(
	component: any,
	options: RenderOptions = {}
): Promise<any> {
	const stdout = new MockStdout(options.columns, options.rows)
	const stderr = new MockStderr()
	const stdin = new MockStdin(stdout)

	const rawInstance = await renderWolfie(component, {
		stdout: stdout as any,
		stderr: stderr as any,
		stdin: stdin as any,
		debug: false,
		maxFps: 30,
		exitOnCtrlC: false,
		providers: options.providers,
		incrementalRendering: false,
	})

	const handle = { unmount: () => rawInstance.unmount() }
	registerInstance(handle)

	return {
		rerender: () => rawInstance.rerender(),
		unmount: () => {
			unregisterInstance(handle)
			rawInstance.unmount()
		},
		cleanup: () => {},
		clear: () => rawInstance.clear(),
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
