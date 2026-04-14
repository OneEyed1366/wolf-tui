import { useContext, Show, type JSX } from 'solid-js'
import type { Styles } from '@wolf-tui/core'
import { AccessibilityCtx, BackgroundCtx } from '../context/symbols'
import { resolveClassName, type ClassNameValue } from '../styles'

//#region Types
type AriaRole =
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

type AriaState = {
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

export interface BoxProps {
	className?: ClassNameValue
	style?: Styles
	'aria-label'?: string
	'aria-hidden'?: boolean
	'aria-role'?: AriaRole
	'aria-state'?: AriaState
	children?: JSX.Element
}
//#endregion Types

//#region Default Styles
const defaultBoxStyles: Partial<Styles> = {
	flexWrap: 'nowrap',
	flexDirection: 'row',
	flexGrow: 0,
	flexShrink: 1,
}
//#endregion Default Styles

export function Box(props: BoxProps) {
	const accessibility = useContext(AccessibilityCtx)
	const inheritedBackgroundColor = useContext(BackgroundCtx)

	const resolvedStyles = () => {
		const style = props.style ?? {}
		const resolved = resolveClassName(props.className)
		return { ...resolved, ...style }
	}

	const backgroundColor = () => {
		const s = resolvedStyles()
		return s.backgroundColor ?? inheritedBackgroundColor?.()
	}

	const isHidden = () =>
		Boolean(accessibility?.isScreenReaderEnabled && props['aria-hidden'])

	// WHY: Accessor functions (not IIFE snapshots) preserve Solid reactivity
	// — re-evaluated whenever props.style or props.className change.
	const boxStyle = () => {
		const style = resolvedStyles()
		return {
			backgroundColor: backgroundColor(),
			overflowX: style.overflowX ?? style.overflow ?? 'visible',
			overflowY: style.overflowY ?? style.overflow ?? 'visible',
			...defaultBoxStyles,
			...style,
		}
	}

	const accessibilityMeta = () => ({
		role: props['aria-role'],
		state: props['aria-state'],
	})

	const renderedChildren = () => {
		const ariaLabel = props['aria-label']
		if (accessibility?.isScreenReaderEnabled && ariaLabel) {
			return <wolfie-text>{ariaLabel}</wolfie-text>
		}
		return props.children
	}

	return (
		<BackgroundCtx.Provider value={backgroundColor}>
			<Show when={!isHidden()}>
				<wolfie-box
					style={boxStyle()}
					internal_accessibility={accessibilityMeta()}
				>
					{renderedChildren()}
				</wolfie-box>
			</Show>
		</BackgroundCtx.Provider>
	)
}

export type { BoxProps as Props, BoxProps as IProps }
