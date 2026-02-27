import type { Styles } from '@wolfie/core'

//#region WNode
export type WNodeType = 'wolfie-box' | 'wolfie-text'

export type WNodeProps = {
	style?: Partial<Styles>
	'aria-label'?: string
	'aria-hidden'?: boolean
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
	internal_transform?: (text: string) => string
}

export type WNode = {
	type: WNodeType
	props: WNodeProps
	children: Array<WNode | string>
	key?: string
}
//#endregion WNode

//#region Factories
export const wbox = (
	props: WNodeProps,
	children: Array<WNode | string>,
	key?: string
): WNode => ({ type: 'wolfie-box', props, children, key })

export const wtext = (
	props: WNodeProps,
	children: Array<WNode | string>
): WNode => ({ type: 'wolfie-text', props, children })
//#endregion Factories
