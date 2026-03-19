import { parseKeypress, nonAlphanumericKeys, logger } from '@wolfie/core'

//#region Types
export type IKey = {
	upArrow: boolean
	downArrow: boolean
	leftArrow: boolean
	rightArrow: boolean
	pageDown: boolean
	pageUp: boolean
	home: boolean
	end: boolean
	return: boolean
	escape: boolean
	ctrl: boolean
	shift: boolean
	tab: boolean
	backspace: boolean
	delete: boolean
	meta: boolean
}
//#endregion Types

//#region Key Parser
export function parseInputData(data: string): { input: string; key: IKey } {
	const keypress = parseKeypress(data)

	const key: IKey = {
		upArrow: keypress.name === 'up',
		downArrow: keypress.name === 'down',
		leftArrow: keypress.name === 'left',
		rightArrow: keypress.name === 'right',
		pageDown: keypress.name === 'pagedown',
		pageUp: keypress.name === 'pageup',
		home: keypress.name === 'home',
		end: keypress.name === 'end',
		return: keypress.name === 'return' || keypress.name === 'enter',
		escape: keypress.name === 'escape',
		ctrl: keypress.ctrl,
		shift: keypress.shift,
		tab: keypress.name === 'tab',
		backspace: keypress.name === 'backspace',
		delete: keypress.name === 'delete',
		meta: keypress.meta || keypress.name === 'escape' || keypress.option,
	}

	let input = keypress.ctrl ? keypress.name : keypress.sequence

	if (nonAlphanumericKeys.includes(keypress.name)) {
		input = ''
	}

	// Strip meta if it's still remaining after parseKeypress
	if (input.startsWith('\u001B')) {
		input = input.slice(1)
	}

	if (
		input.length === 1 &&
		typeof input[0] === 'string' &&
		/[A-Z]/.test(input[0])
	) {
		key.shift = true
	}

	if (logger.enabled) {
		logger.log({
			ts: performance.now(),
			cat: 'input',
			op: 'key',
			name: keypress.name,
			ctrl: keypress.ctrl,
			meta: keypress.meta,
			shift: keypress.shift,
			sequence: keypress.sequence,
		})
	}

	return { input, key }
}
//#endregion Key Parser
