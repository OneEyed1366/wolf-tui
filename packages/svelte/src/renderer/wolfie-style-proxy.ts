import {
	setStyle,
	applyLayoutStyle,
	type DOMElement,
	type Styles,
	type LayoutTree,
} from '@wolfie/core'

// WHY: Maps both camelCase and kebab-case CSS property names to IStyles keys.
// Svelte's compiled output may use either form depending on context.
const CSS_TO_WOLFIE: Record<string, keyof Styles> = {
	color: 'color',
	'background-color': 'backgroundColor',
	backgroundColor: 'backgroundColor',
	'font-weight': 'fontWeight',
	fontWeight: 'fontWeight',
	'font-style': 'fontStyle',
	fontStyle: 'fontStyle',
	'text-decoration': 'textDecoration',
	textDecoration: 'textDecoration',
	display: 'display',
	'flex-direction': 'flexDirection',
	flexDirection: 'flexDirection',
	'flex-grow': 'flexGrow',
	flexGrow: 'flexGrow',
	'flex-shrink': 'flexShrink',
	flexShrink: 'flexShrink',
	'flex-wrap': 'flexWrap',
	flexWrap: 'flexWrap',
	'align-items': 'alignItems',
	alignItems: 'alignItems',
	'justify-content': 'justifyContent',
	justifyContent: 'justifyContent',
	width: 'width',
	height: 'height',
	padding: 'padding',
	'padding-top': 'paddingTop',
	paddingTop: 'paddingTop',
	'padding-right': 'paddingRight',
	paddingRight: 'paddingRight',
	'padding-bottom': 'paddingBottom',
	paddingBottom: 'paddingBottom',
	'padding-left': 'paddingLeft',
	paddingLeft: 'paddingLeft',
	margin: 'margin',
	'margin-top': 'marginTop',
	marginTop: 'marginTop',
	overflow: 'overflow',
	'overflow-x': 'overflowX',
	overflowX: 'overflowX',
	'overflow-y': 'overflowY',
	overflowY: 'overflowY',
	gap: 'gap',
}

export interface StyleProxyConfig {
	el: DOMElement
	getLayoutTree: () => LayoutTree
	scheduleRender: () => void
}

export function createStyleProxy(cfg: StyleProxyConfig): CSSStyleDeclaration {
	return new Proxy({} as CSSStyleDeclaration, {
		set(_t, prop: string, value: string) {
			const key = CSS_TO_WOLFIE[prop]
			if (key) {
				const partial = { [key]: value } as Partial<Styles>
				setStyle(cfg.el, partial as Styles)
				if (cfg.el.layoutNodeId !== undefined) {
					applyLayoutStyle(
						cfg.getLayoutTree(),
						cfg.el.layoutNodeId,
						partial as Styles
					)
				}
				cfg.scheduleRender()
			}
			// WHY: Always return true — returning false throws TypeError in strict mode.
			// Unknown CSS properties are silently ignored.
			return true
		},
		get(_t, prop: string) {
			if (prop === 'setProperty') {
				return (name: string, value: string) => {
					const key = CSS_TO_WOLFIE[name]
					if (key) {
						const partial = { [key]: value } as Partial<Styles>
						setStyle(cfg.el, partial as Styles)
						if (cfg.el.layoutNodeId !== undefined) {
							applyLayoutStyle(
								cfg.getLayoutTree(),
								cfg.el.layoutNodeId,
								partial as Styles
							)
						}
						cfg.scheduleRender()
					}
				}
			}
			if (prop === 'removeProperty') return () => ''
			if (prop === 'cssText') return ''
			return ''
		},
	})
}
