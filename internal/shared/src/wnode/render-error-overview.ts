import * as fs from 'node:fs'
import { cwd } from 'node:process'
import StackUtils from 'stack-utils'
import codeExcerpt from 'code-excerpt'
import { wbox, wtext } from './types'
import type { WNode, WNodeProps } from './types'

//#region Helpers
const stackUtils = new StackUtils({
	cwd: cwd(),
	internals: StackUtils.nodeInternals(),
})

function cleanupPath(path: string | undefined): string | undefined {
	return path?.replace(`file://${cwd()}/`, '')
}
//#endregion Helpers

//#region ViewState
export type ErrorOverviewExcerptLine = {
	line: number
	value: string
	isError: boolean
}

export type ErrorOverviewStackLine = {
	raw: string
	parsed?: {
		fn?: string
		file?: string
		line?: number
		column?: number
	}
}

export type ErrorOverviewViewState = {
	errorMessage: string
	origin?: { filePath: string; line: number; column?: number }
	excerpt?: ErrorOverviewExcerptLine[]
	stackLines?: ErrorOverviewStackLine[]
	/** Max digit count of line numbers in excerpt — for left-pad alignment. */
	lineWidth: number
}
//#endregion ViewState

//#region Parse (IO — not pure, called by adapter component)
export function parseErrorToViewState(error: Error): ErrorOverviewViewState {
	const rawStack = error.stack ? error.stack.split('\n').slice(1) : undefined
	const origin = rawStack ? stackUtils.parseLine(rawStack[0]!) : undefined
	const filePath = cleanupPath(origin?.file)

	let excerpt: ErrorOverviewExcerptLine[] | undefined
	let lineWidth = 0

	if (filePath && origin?.line && fs.existsSync(filePath)) {
		const sourceCode = fs.readFileSync(filePath, 'utf8')
		// WHY: codeExcerpt returns surrounding lines for context, same as existing adapters
		const raw = codeExcerpt(sourceCode, origin.line)
		if (raw) {
			excerpt = raw.map(({ line, value }) => ({
				line,
				value,
				isError: line === origin.line,
			}))
			for (const { line } of excerpt) {
				lineWidth = Math.max(lineWidth, String(line).length)
			}
		}
	}

	const stackLines = rawStack?.map((line) => {
		const parsed = stackUtils.parseLine(line)
		return {
			raw: line,
			parsed: parsed
				? {
						fn: parsed.function ?? undefined,
						file: cleanupPath(parsed.file) ?? undefined,
						line: parsed.line ?? undefined,
						column: parsed.column ?? undefined,
					}
				: undefined,
		}
	})

	return {
		errorMessage: error.message,
		origin:
			origin && filePath
				? { filePath, line: origin.line!, column: origin.column ?? undefined }
				: undefined,
		excerpt,
		stackLines,
		lineWidth,
	}
}
//#endregion Parse

//#region Theme
export type ErrorOverviewRenderTheme = {
	styles: {
		container: () => WNodeProps
		errorBadge: () => WNodeProps
		errorMessage: () => WNodeProps
		locationRow: () => WNodeProps
		location: () => WNodeProps
		excerptContainer: () => WNodeProps
		lineNumberBox: (props: { lineWidth: number }) => WNodeProps
		errorLineNumber: () => WNodeProps
		lineNumber: () => WNodeProps
		errorLineContent: () => WNodeProps
		lineContent: () => WNodeProps
		stackContainer: () => WNodeProps
		stackDash: () => WNodeProps
		stackFn: () => WNodeProps
		stackLocation: () => WNodeProps
		stackRaw: () => WNodeProps
	}
}

export const defaultErrorOverviewTheme: ErrorOverviewRenderTheme = {
	styles: {
		container: (): WNodeProps => ({
			style: { flexDirection: 'column', padding: 1 },
		}),
		errorBadge: (): WNodeProps => ({
			style: { backgroundColor: 'red', color: 'white' },
		}),
		errorMessage: (): WNodeProps => ({}),
		locationRow: (): WNodeProps => ({ style: { marginTop: 1 } }),
		location: (): WNodeProps => ({ style: { color: 'gray' } }),
		excerptContainer: (): WNodeProps => ({
			style: { flexDirection: 'column', marginTop: 1 },
		}),
		lineNumberBox: ({ lineWidth }): WNodeProps => ({
			style: { width: lineWidth + 1 },
		}),
		errorLineNumber: (): WNodeProps => ({
			style: { color: 'white', backgroundColor: 'red' },
		}),
		lineNumber: (): WNodeProps => ({ style: { color: 'gray' } }),
		errorLineContent: (): WNodeProps => ({
			style: { backgroundColor: 'red', color: 'white' },
		}),
		lineContent: (): WNodeProps => ({}),
		stackContainer: (): WNodeProps => ({
			style: { flexDirection: 'column', marginTop: 1 },
		}),
		stackDash: (): WNodeProps => ({ style: { color: 'gray' } }),
		stackFn: (): WNodeProps => ({
			style: { color: 'gray', fontWeight: 'bold' },
		}),
		stackLocation: (): WNodeProps => ({ style: { color: 'gray' } }),
		stackRaw: (): WNodeProps => ({
			style: { color: 'gray', fontWeight: 'bold' },
		}),
	},
}
//#endregion Theme

//#region Render (pure)
export function renderErrorOverview(
	state: ErrorOverviewViewState,
	theme: ErrorOverviewRenderTheme = defaultErrorOverviewTheme
): WNode {
	const { errorMessage, origin, excerpt, stackLines, lineWidth } = state
	const { styles } = theme
	const sections: Array<WNode | string> = []

	// Error badge row
	sections.push(
		wbox({}, [
			wtext(styles.errorBadge(), [' ERROR ']),
			wtext(styles.errorMessage(), [' ' + errorMessage]),
		])
	)

	// File location
	if (origin) {
		const loc = `${origin.filePath}:${origin.line}${origin.column != null ? ':' + origin.column : ''}`
		sections.push(wbox(styles.locationRow(), [wtext(styles.location(), [loc])]))
	}

	// Code excerpt
	if (excerpt && excerpt.length > 0) {
		const rows = excerpt.map(({ line, value, isError }) =>
			wbox({}, [
				wbox(styles.lineNumberBox({ lineWidth }), [
					wtext(isError ? styles.errorLineNumber() : styles.lineNumber(), [
						`${String(line).padStart(lineWidth, ' ')}:`,
					]),
				]),
				wtext(isError ? styles.errorLineContent() : styles.lineContent(), [
					' ' + value,
				]),
			])
		)
		sections.push(wbox(styles.excerptContainer(), rows))
	}

	// Stack trace
	if (stackLines && stackLines.length > 0) {
		const rows = stackLines.map(({ raw, parsed }) => {
			if (!parsed || !parsed.fn) {
				return wbox({}, [
					wtext(styles.stackDash(), ['- ']),
					wtext(styles.stackRaw(), [raw + '\t ']),
				])
			}
			return wbox({}, [
				wtext(styles.stackDash(), ['- ']),
				wtext(styles.stackFn(), [parsed.fn]),
				wtext(styles.stackLocation(), [
					` (${parsed.file ?? ''}:${parsed.line}:${parsed.column})`,
				]),
			])
		})
		sections.push(wbox(styles.stackContainer(), rows))
	}

	return wbox(styles.container(), sections)
}
//#endregion Render
