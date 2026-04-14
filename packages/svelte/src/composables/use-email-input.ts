import chalk from 'chalk'
import { useInput } from './use-input.js'
import type { EmailInputState } from './use-email-input-state.svelte.js'

//#region Types
export type UseEmailInputProps = {
	isDisabled?: () => boolean | undefined
	state: EmailInputState
	placeholder?: string
}

export type UseEmailInputResult = {
	inputValue: () => string
}
//#endregion Types

//#region Composable
let _cursor: string | undefined
const getCursor = () => (_cursor ??= chalk.inverse(' '))

export const useEmailInput = ({
	isDisabled,
	state,
	placeholder = '',
}: UseEmailInputProps): UseEmailInputResult => {
	const isActive = () => !(isDisabled?.() ?? false)

	const renderedPlaceholder = () => {
		if (isDisabled?.() ?? false) {
			return placeholder ? chalk.dim(placeholder) : ''
		}
		return placeholder && placeholder.length > 0
			? chalk.inverse(placeholder[0]!) + chalk.dim(placeholder.slice(1))
			: getCursor()
	}

	const renderedValue = () => {
		if (isDisabled?.() ?? false) {
			return state.value()
		}

		let index = 0
		let result = state.value().length > 0 ? '' : getCursor()

		for (const char of state.value()) {
			result += index === state.cursorOffset() ? chalk.inverse(char) : char
			index++
		}

		if (state.suggestion()) {
			if (state.cursorOffset() === state.value().length) {
				result +=
					chalk.inverse(state.suggestion()![0]!) +
					chalk.dim(state.suggestion()!.slice(1))
			} else {
				result += chalk.dim(state.suggestion())
			}
			return result
		}

		if (
			state.value().length > 0 &&
			state.cursorOffset() === state.value().length
		) {
			result += getCursor()
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
