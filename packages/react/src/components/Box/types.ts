import type { ClassNameValue } from '../../styles/index'

export type IProps = {
	/**
	CSS-like class name for styling. Supports:
	- String class name: 'container'
	- Space-separated classes: 'flex gap-2'
	- Style object (from CSS Modules): { padding: 2 }
	- Array of the above: ['base', { gap: 4 }]

	The `style` prop takes precedence over className when both are provided.
	*/
	className?: ClassNameValue

	/**
	CSS-like inline styles.
	*/
	style?: import('@wolfie/core').Styles

	/**
	A label for the element for screen readers.
	*/
	'aria-label'?: string

	/**
	Hide the element from screen readers.
	*/
	'aria-hidden'?: boolean

	/**
	The role of the element.
	*/
	'aria-role'?:
		| 'button'
		| 'checkbox'
		| 'combobox'
		| 'list'
		| 'listbox'
		| 'listitem'
		| 'menu'
		| 'menuitem'
		| 'option'
		| 'progressbar'
		| 'radio'
		| 'radiogroup'
		| 'tab'
		| 'tablist'
		| 'table'
		| 'textbox'
		| 'timer'
		| 'toolbar'

	/**
	The state of the element.
	*/
	'aria-state'?: {
		busy?: boolean
		checked?: boolean
		disabled?: boolean
		expanded?: boolean
		multiline?: boolean
		multiselectable?: boolean
		readonly?: boolean
		required?: boolean
		selected?: boolean
	}
}

export type Props = IProps
