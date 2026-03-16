//#region Types
export type UseTextInputStateProps = {
	defaultValue?: string
	suggestions?: string[]
	onChange?: (value: string) => void
	onSubmit?: (value: string) => void
}

export type TextInputState = {
	previousValue: () => string
	value: () => string
	cursorOffset: () => number
	suggestion: () => string | undefined
	moveCursorLeft: () => void
	moveCursorRight: () => void
	insert: (text: string) => void
	delete: () => void
	submit: () => void
}
//#endregion Types

//#region Composable
export const useTextInputState = ({
	defaultValue = '',
	suggestions,
	onChange,
	onSubmit,
}: UseTextInputStateProps = {}): TextInputState => {
	let _previousValue = defaultValue
	let _value = defaultValue
	let _cursorOffset = defaultValue.length

	const previousValue = () => _previousValue
	const value = () => _value
	const cursorOffset = () => _cursorOffset

	const suggestion = () => {
		if (_value.length === 0) return undefined
		return suggestions?.find((s) => s.startsWith(_value))?.replace(_value, '')
	}

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
		if (suggestion()) {
			const s = suggestion()
			if (s) insert(s)
			onSubmit?.(_value)
			return
		}
		onSubmit?.(_value)
	}

	return {
		previousValue,
		value,
		cursorOffset,
		suggestion,
		moveCursorLeft,
		moveCursorRight,
		insert,
		delete: deleteCharacter,
		submit,
	}
}
//#endregion Composable
