import * as fs from 'node:fs'
import { cwd } from 'node:process'
import StackUtils from 'stack-utils'
import codeExcerpt from 'code-excerpt'
import {
	renderErrorOverview,
	type ErrorOverviewData,
	type ErrorOverviewStackFrame,
} from '@wolfie/shared'
import { wNodeToReact } from '../../wnode/wnode-to-react'
import type { IProps } from './types'

const cleanupPath = (path: string | undefined): string | undefined => {
	return path?.replace(`file://${cwd()}/`, '')
}

const stackUtils = new StackUtils({
	cwd: cwd(),
	internals: StackUtils.nodeInternals(),
})

export function ErrorOverview({ error }: IProps) {
	const stack = error.stack ? error.stack.split('\n').slice(1) : undefined
	const origin = stack ? stackUtils.parseLine(stack[0]!) : undefined
	const filePath = cleanupPath(origin?.file)
	let excerpt: Array<{ line: number; value: string }> | undefined
	let lineWidth = 0

	if (filePath && origin?.line && fs.existsSync(filePath)) {
		const sourceCode = fs.readFileSync(filePath, 'utf8')
		const raw = codeExcerpt(sourceCode, origin.line)
		if (raw) {
			excerpt = raw
			for (const { line } of raw) {
				lineWidth = Math.max(lineWidth, String(line).length)
			}
		}
	}

	const stackFrames: ErrorOverviewStackFrame[] = error.stack
		? error.stack
				.split('\n')
				.slice(1)
				.map((line): ErrorOverviewStackFrame => {
					const parsed = stackUtils.parseLine(line)
					if (!parsed) return { parsed: false, raw: line }
					return {
						parsed: true,
						fn: parsed.function,
						file: cleanupPath(parsed.file),
						line: parsed.line,
						column: parsed.column,
					}
				})
		: []

	const data: ErrorOverviewData = {
		message: error.message,
		origin: origin
			? {
					filePath: filePath ?? undefined,
					line: origin.line,
					column: origin.column,
				}
			: undefined,
		excerpt,
		lineWidth,
		stackFrames,
	}

	return wNodeToReact(renderErrorOverview(data))
}

export type { IProps as Props } from './types'
export type { IProps } from './types'
