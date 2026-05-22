import { renderWolfie } from '@wolf-tui/angular'
import { MockStdout, MockStderr, MockStdin } from '../core/index.js'

export interface RenderOptions {
	columns?: number
	rows?: number
	providers?: any[]
}

export async function render(component: any, options: RenderOptions = {}) {
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

	return {
		rerender: () => rawInstance.rerender(),
		unmount: () => rawInstance.unmount(),
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
