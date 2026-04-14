import { useContext, Show, type JSX } from 'solid-js'
import chalk from 'chalk'
import { colorize, type Styles } from '@wolf-tui/core'
import { AccessibilityCtx, BackgroundCtx } from '../context/symbols'
import { resolveClassName, type ClassNameValue } from '../styles'

//#region Types
export interface TextProps {
	className?: ClassNameValue
	style?: Styles
	'aria-label'?: string
	'aria-hidden'?: boolean
	children?: JSX.Element
}
//#endregion Types

export function Text(props: TextProps) {
	const accessibility = useContext(AccessibilityCtx)
	const inheritedBackgroundColor = useContext(BackgroundCtx)

	// Accessor — re-evaluated on every access inside a reactive context.
	// WHY: IIFE pattern snapshots props once at mount; accessors let
	// Solid's reactivity trigger on prop changes (e.g. dynamic color).
	const effectiveStyles = (): Styles => {
		const resolved = resolveClassName(props.className)
		return { ...resolved, ...(props.style ?? {}) }
	}

	const transform = (text: string): string => {
		const styles = effectiveStyles()
		let result = text

		if (styles.color) {
			result = colorize(result, styles.color, 'foreground')
		}

		const finalBackgroundColor =
			styles.backgroundColor ?? inheritedBackgroundColor?.()
		if (finalBackgroundColor) {
			result = colorize(result, finalBackgroundColor, 'background')
		}

		if (styles.fontWeight === 'bold') result = chalk.bold(result)
		if (styles.fontStyle === 'italic') result = chalk.italic(result)
		if (styles.textDecoration === 'underline') result = chalk.underline(result)
		if (styles.textDecoration === 'line-through')
			result = chalk.strikethrough(result)
		if (styles.inverse ?? false) result = chalk.inverse(result)

		return result
	}

	const renderedChildren = () => {
		const isScreenReaderEnabled = accessibility?.isScreenReaderEnabled
		const ariaLabel = props['aria-label']
		return isScreenReaderEnabled && ariaLabel ? ariaLabel : props.children
	}

	const isHidden = () => {
		const isScreenReaderEnabled = accessibility?.isScreenReaderEnabled
		const ariaHidden = props['aria-hidden']
		if (isScreenReaderEnabled && ariaHidden) return true
		const children = renderedChildren()
		return children === undefined || children === null
	}

	return (
		<Show when={!isHidden()}>
			<wolfie-text
				style={{
					...effectiveStyles(),
					textWrap: effectiveStyles().textWrap ?? 'wrap',
				}}
				internal_transform={transform}
			>
				{renderedChildren()}
			</wolfie-text>
		</Show>
	)
}

export type { TextProps as Props, TextProps as IProps }
