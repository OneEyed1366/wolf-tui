import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import chalk from 'chalk'
import { useInput } from './use-input'
import type { PasswordInputState } from './use-password-input-state'

//#region Types
export type UsePasswordInputProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: MaybeRefOrGetter<boolean | undefined>

	/**
	 * Password input state.
	 */
	state: PasswordInputState

	/**
	 * Text to display when `value` is empty.
	 *
	 * @default ""
	 */
	placeholder?: string
}

export type UsePasswordInputResult = {
	/**
	 * Value to render inside the input.
	 */
	inputValue: ComputedRef<string>
}
//#endregion Types

//#region Composable
let _cursor: string | undefined
const getCursor = () => (_cursor ??= chalk.inverse(' '))

export const usePasswordInput = ({
	isDisabled = false,
	state,
	placeholder = '',
}: UsePasswordInputProps): UsePasswordInputResult => {
	const isActive = computed(() => !toValue(isDisabled))

	const renderedPlaceholder = computed(() => {
		if (toValue(isDisabled)) {
			return placeholder ? chalk.dim(placeholder) : ''
		}

		return placeholder && placeholder.length > 0
			? chalk.inverse(placeholder[0]!) + chalk.dim(placeholder.slice(1))
			: getCursor()
	})

	const renderedValue = computed(() => {
		const maskedValue = '*'.repeat(state.value.value.length)

		if (toValue(isDisabled)) {
			return maskedValue
		}

		let index = 0
		let result = maskedValue.length > 0 ? '' : getCursor()

		for (const char of maskedValue) {
			result += index === state.cursorOffset.value ? chalk.inverse(char) : char
			index++
		}

		if (
			maskedValue.length > 0 &&
			state.cursorOffset.value === maskedValue.length
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

	const inputValue = computed(() =>
		state.value.value.length > 0
			? renderedValue.value
			: renderedPlaceholder.value
	)

	return {
		inputValue,
	}
}
//#endregion Composable
