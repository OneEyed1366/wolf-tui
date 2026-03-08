import * as fs from 'node:fs'
import { cwd } from 'node:process'
import { defineComponent, type PropType } from 'vue'
import StackUtils from 'stack-utils'
import codeExcerpt from 'code-excerpt'
import {
	renderErrorOverview,
	type ErrorOverviewData,
	type ErrorOverviewStackFrame,
} from '@wolfie/shared'
import { wNodeToVue } from '../wnode/wnode-to-vue'

//#region Types
export interface ErrorOverviewProps {
	/**
	 * The error object to display.
	 */
	error: Error
}
//#endregion Types

//#region Helpers
const cleanupPath = (path: string | undefined): string | undefined => {
	return path?.replace(`file://${cwd()}/`, '')
}

const stackUtils = new StackUtils({
	cwd: cwd(),
	internals: StackUtils.nodeInternals(),
})
//#endregion Helpers

//#region Component
/**
 * `<ErrorOverview>` displays an error with its stack trace and code context.
 * It parses the error stack, extracts file locations, and shows surrounding code.
 */
export const ErrorOverview = defineComponent({
	name: 'ErrorOverview',
	props: {
		error: {
			type: Object as PropType<Error>,
			required: true,
		},
	},
	setup(props) {
		return () => {
			const { error } = props
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

			return wNodeToVue(renderErrorOverview(data))
		}
	},
})
//#endregion Component

export type { ErrorOverviewProps as Props, ErrorOverviewProps as IProps }
