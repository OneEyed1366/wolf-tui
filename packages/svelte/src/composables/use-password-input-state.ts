//#region Types
export type UsePasswordInputStateProps = {
	onChange?: (value: string) => void
	onSubmit?: (value: string) => void
}

export type PasswordInputState = {
	previousValue: () => string
	value: () => string
	cursorOffset: () => number
	moveCursorLeft: () => void
	moveCursorRight: () => void
	insert: (text: string) => void
	delete: () => void
	submit: () => void
}
//#endregion Types

//#region Composable
export const usePasswordInputState = ({
	onChange,
	onSubmit,
}: UsePasswordInputStateProps = {}): PasswordInputState => {
	let _previousValue = ''
	let _value = ''
	let _cursorOffset = 0

	const previousValue = () => _previousValue
	const value = () => _value
	const cursorOffset = () => _cursorOffset

	const moveCursorLeft = () => {
		_cursorOffset = Math.max(0, _cursorOffset - 1)
	}

	const moveCursorRight = () => {
		_cursorOffset = Math.min(_value.length, _cursorOffset + 1)
	}

	const insert = (text: string) => {
		_previousValue = _value
		_value = _value.slice(0, _cursorOffset) + text + _value.slice(_cursorOffset)
		_cursorOffset += text.length
		onChange?.(_value)
	}

	const deleteCharacter = () => {
		const newCursorOffset = Math.max(0, _cursorOffset - 1)
		_previousValue = _value
		_value =
			_value.slice(0, newCursorOffset) + _value.slice(newCursorOffset + 1)
		_cursorOffset = newCursorOffset
		onChange?.(_value)
	}

	const submit = () => {
		onSubmit?.(_value)
	}

	return {
		previousValue,
		value,
		cursorOffset,
		moveCursorLeft,
		moveCursorRight,
		insert,
		delete: deleteCharacter,
		submit,
	}
}
//#endregion Composable
