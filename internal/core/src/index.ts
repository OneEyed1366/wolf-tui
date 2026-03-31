// Taffy-based core exports
// Yoga has been removed - Taffy is now the only layout engine

export type {
	DOMElement as DOMElement,
	DOMNode,
	DOMNodeAttribute,
	TextNode,
	ITextName as TextName,
	INodeNames as NodeNames,
	IElementNames as ElementNames,
} from './dom'
export {
	createNode,
	appendChildNode,
	insertBeforeNode,
	removeChildNode,
	setAttribute,
	setStyle,
	createTextNode,
	setTextNodeValue,
	isElement,
	isText,
} from './dom'
export { default as Output } from './output'
export { default as renderer } from './renderer'
export type { IStyles as Styles } from './styles'
export {
	applyLayoutStyle,
	toLayoutStyle,
	resolveViewportUnits,
	parseNumericValue,
	expandStyles,
	normalizeStyleKeys,
} from './styles'
export { default as parseKeypress, nonAlphanumericKeys } from './parse-keypress'
export { default as measureElement } from './measure-element'
export { default as measureText } from './measure-text'
export { default as wrapText } from './wrap-text'
export { default as squashTextNodes } from './squash-text-nodes'
export { default as renderBorder } from './render-border'
export { default as renderBackground } from './render-background'
export { default as getMaxWidth } from './get-max-width'
export { default as colorize } from './colorize'
export { type IOutputTransformer as OutputTransformer } from './render-node-to-output'
export { default as renderNodeToOutput } from './render-node-to-output'
export { default as logUpdate } from './log-update'
export type { ILogUpdate as LogUpdate } from './log-update'

// Taffy layout helpers
export {
	getComputedLayout,
	isDisplayNone,
	type ComputedLayout,
} from './get-computed-layout'
export type { LayoutTree, LayoutStyle } from './layout-types'
export { logger, createLogger, type LogEvent, type LogCategory } from './logger'
export { LoggedLayoutTree } from './layout-logger'
