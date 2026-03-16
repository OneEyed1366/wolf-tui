import chalk from 'chalk'
import { useInput } from './use-input.js'
import type { PasswordInputState } from './use-password-input-state.js'

//#region Types
export type UsePasswordInputProps = {
	isDisabled?: () => boolean | undefined
	state: PasswordInputState
	placeholder?: string
}

export type UsePasswordInputResult = {
	inputValue: () => string
}
//#endregion Types

//#region Composable
const cursor = chalk.inverse(' ')

export const usePasswordInput = ({
	isDisabled,
	state,
	placeholder = '',
}: UsePasswordInputProps): UsePasswordInputResult => {
	const isActive = () => !(isDisabled?.() ?? false)

	const renderedPlaceholder = () => {
		if (isDisabled?.() ?? false) {
			return placeholder ? chalk.dim(placeholder) : ''
		}
		return placeholder && placeholder.length > 0
			? chalk.inverse(placeholder[0]!) + chalk.dim(placeholder.slice(1))
			: cursor
	}

	const renderedValue = () => {
		const maskedValue = '*'.repeat(state.value().length)

		if (isDisabled?.() ?? false) {
			return maskedValue
		}

		let index = 0
		let result = maskedValue.length > 0 ? '' : cursor

		for (const char of maskedValue) {
			result += index === state.cursorOffset() ? chalk.inverse(char) : char
			index++
		}

		if (maskedValue.length > 0 && state.cursorOffset() === maskedValue.length) {
			result += cursor
		}

		return result
	}

	useInput(
		(input, key) => {
			if (
				key.upArrow ||
				key.downArrow ||
				(key.ctrl && input === 'c') ||
				key.tab ||
				(key.shift && key.tab)
			) {
				return
			}
			if (key.return) {
				state.submit()
				return
			}
			if (key.leftArrow) {
				state.moveCursorLeft()
			} else if (key.rightArrow) {
				state.moveCursorRight()
			} else if (key.backspace || key.delete) {
				state.delete()
			} else {
				state.insert(input)
			}
		},
		{ isActive }
	)

	const inputValue = () =>
		state.value().length > 0 ? renderedValue() : renderedPlaceholder()

	return { inputValue }
}
//#endregion Composable
