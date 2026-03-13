import * as fs from 'node:fs'
import { cwd } from 'node:process'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	computed,
	signal,
} from '@angular/core'
import StackUtils from 'stack-utils'
import codeExcerpt from 'code-excerpt'
import {
	renderErrorOverview,
	type ErrorOverviewData,
	type ErrorOverviewStackFrame,
} from '@wolfie/shared'
import { WNodeOutletComponent } from '../wnode-outlet/wnode-outlet.component'

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
 * `<w-error-overview>` displays an error with its stack trace and code context.
 * It parses the error stack, extracts file locations, and shows surrounding code.
 */
@Component({
	selector: 'w-error-overview',
	standalone: true,
	imports: [WNodeOutletComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<w-wnode-outlet [node]="wnode()" />`,
})
export class ErrorOverviewComponent {
	//#region Inputs
	@Input({ required: true })
	set error(value: Error) {
		this._error.set(value)
	}
	//#endregion Inputs

	//#region Internal State
	private _error = signal<Error>(new Error(''))
	//#endregion Internal State

	//#region Computed Properties
	readonly wnode = computed(() => {
		const error = this._error()
		const stack = error.stack ? error.stack.split('\n').slice(1) : undefined
		const origin = stack ? stackUtils.parseLine(stack[0]!) : undefined
		const filePath = cleanupPath(origin?.file)
		let excerpt: Array<{ line: number; value: string }> | undefined
		let lineWidth = 0

		if (filePath && origin?.line && fs.existsSync(filePath)) {
			try {
				const sourceCode = fs.readFileSync(filePath, 'utf8')
				const raw = codeExcerpt(sourceCode, origin.line)
				if (raw) {
					excerpt = raw
					for (const { line } of raw) {
						lineWidth = Math.max(lineWidth, String(line).length)
					}
				}
			} catch {
				// ignore read errors
			}
		}

		const stackFrames: ErrorOverviewStackFrame[] = error.stack
			? error.stack
					.split('\n')
					.slice(1)
					.map((line): ErrorOverviewStackFrame => {
						const parsed = stackUtils.parseLine(line) as {
							function?: string
							file?: string
							line?: number
							column?: number
						} | null
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

		return renderErrorOverview(data)
	})
	//#endregion Computed Properties
}
//#endregion Component

export type { ErrorOverviewProps as Props, ErrorOverviewProps as IProps }
