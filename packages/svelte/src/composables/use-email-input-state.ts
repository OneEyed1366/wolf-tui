import { DEFAULT_DOMAINS } from '@wolfie/shared'

//#region Types
export type UseEmailInputStateProps = {
	defaultValue?: string
	domains?: string[]
	onChange?: (value: string) => void
	onSubmit?: (value: string) => void
}

export type EmailInputState = {
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
export const useEmailInputState = ({
	defaultValue = '',
	domains = DEFAULT_DOMAINS,
	onChange,
	onSubmit,
}: UseEmailInputStateProps = {}): EmailInputState => {
	let _previousValue = defaultValue
	let _value = defaultValue
	let _cursorOffset = defaultValue.length

	const previousValue = () => _previousValue
	const value = () => _value
	const cursorOffset = () => _cursorOffset

	const suggestion = () => {
		if (_value.length === 0 || !_value.includes('@')) return undefined
		const atIndex = _value.indexOf('@')
		const enteredDomain = _value.slice(atIndex + 1)
		return domains
			?.find((d) => d.startsWith(enteredDomain))
			?.replace(enteredDomain, '')
	}

	const moveCursorLeft = () => {
		_cursorOffset = Math.max(0, _cursorOffset - 1)
	}

	const moveCursorRight = () => {
		_cursorOffset = Math.min(_value.length, _cursorOffset + 1)
	}

	const insert = (text: string) => {
		// Prevent multiple @ symbols
		if (_value.includes('@') && text.includes('@')) return

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
