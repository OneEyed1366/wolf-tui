import chalk from 'chalk'

let _cursor: string | undefined
const getCursor = () => (_cursor ??= chalk.inverse(' '))

//#region Renderer
export function renderTextInputValue(options: {
	value: string
	cursorOffset: number
	suggestion?: string
	isDisabled: boolean
}): string {
	const { value, cursorOffset, suggestion, isDisabled } = options

	if (isDisabled) {
		return value
	}

	let index = 0
	let result = value.length > 0 ? '' : getCursor()

	for (const char of value) {
		result += index === cursorOffset ? chalk.inverse(char) : char
		index++
	}

	if (suggestion) {
		if (cursorOffset === value.length) {
			result += chalk.inverse(suggestion[0]!) + chalk.dim(suggestion.slice(1))
		} else {
			result += chalk.dim(suggestion)
		}

		return result
	}

	if (value.length > 0 && cursorOffset === value.length) {
		result += getCursor()
	}

	return result
}

export function renderTextInputPlaceholder(options: {
	placeholder: string
	isDisabled: boolean
}): string {
	const { placeholder, isDisabled } = options

	if (isDisabled) {
		return placeholder ? chalk.dim(placeholder) : ''
	}

	return placeholder && placeholder.length > 0
		? chalk.inverse(placeholder[0]!) + chalk.dim(placeholder.slice(1))
		: getCursor()
}
//#endregion Renderer
