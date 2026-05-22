/* eslint-disable no-control-regex */
export function delay(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms))
}

const ansiRegex =
	/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

export function stripAnsi(str: string): string {
	return str.replace(ansiRegex, '')
}
