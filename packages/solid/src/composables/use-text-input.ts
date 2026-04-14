import { createMemo } from 'solid-js'
import chalk from 'chalk'
import { useInput } from './use-input'
import type { TextInputState } from './use-text-input-state'

//#region Types
export type UseTextInputProps = {
	isDisabled?: () => boolean | undefined
	state: TextInputState
	placeholder?: string
}

export type UseTextInputResult = {
	inputValue: () => string
}
//#endregion Types

//#region Composable
let _cursor: string | undefined
const getCursor = () => (_cursor ??= chalk.inverse(' '))

export const useTextInput = ({
	isDisabled,
	state,
	placeholder = '',
}: UseTextInputProps): UseTextInputResult => {
	const isActive = createMemo(() => !(isDisabled?.() ?? false))

	const renderedPlaceholder = createMemo(() => {
		if (isDisabled?.() ?? false) {
			return placeholder ? chalk.dim(placeholder) : ''
		}
		return placeholder && placeholder.length > 0
			? chalk.inverse(placeholder[0]!) + chalk.dim(placeholder.slice(1))
			: getCursor()
	})

	const renderedValue = createMemo(() => {
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
	})

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

	const inputValue = createMemo(() =>
		state.value().length > 0 ? renderedValue() : renderedPlaceholder()
	)

	return { inputValue }
}
//#endregion Composable
