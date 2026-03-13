import { wbox, wtext } from './types'
import type { WNode } from './types'
import type { ErrorOverviewData } from './view-states'

//#region Render
export function renderErrorOverview(data: ErrorOverviewData): WNode {
	const { message, origin, excerpt, lineWidth, stackFrames } = data
	const children: Array<WNode | string> = []

	// Header: [ERROR badge] [message]
	children.push(
		wbox({}, [
			wtext({ style: { backgroundColor: 'red', color: 'white' } }, [' ERROR ']),
			wtext({}, [' ' + message]),
		])
	)

	// Origin line (optional)
	if (origin?.filePath) {
		children.push(
			wbox({ style: { marginTop: 1 } }, [
				wtext({ style: { color: 'gray' } }, [
					`${origin.filePath}:${origin.line}:${origin.column}`,
				]),
			])
		)
	}

	// Code excerpt (optional)
	if (excerpt && excerpt.length > 0) {
		const excerptRows = excerpt.map(({ line, value }): WNode => {
			const isErrorLine = line === origin?.line
			return wbox(
				{},
				[
					wbox({ style: { width: lineWidth + 1 } }, [
						wtext(
							{
								style: {
									color: isErrorLine ? 'white' : 'gray',
									backgroundColor: isErrorLine ? 'red' : undefined,
								},
								'aria-label': isErrorLine
									? `Line ${line}, error`
									: `Line ${line}`,
							},
							[String(line).padStart(lineWidth, ' ') + ':']
						),
					]),
					wtext(
						{
							style: {
								backgroundColor: isErrorLine ? 'red' : undefined,
								color: isErrorLine ? 'white' : undefined,
							},
						},
						[' ' + value]
					),
				],
				String(line)
			)
		})
		children.push(
			wbox({ style: { marginTop: 1, flexDirection: 'column' } }, excerptRows)
		)
	}

	// Stack frames
	if (stackFrames.length > 0) {
		const frameNodes = stackFrames.map((frame, index): WNode => {
			if (!frame.parsed) {
				return wbox(
					{},
					[
						wtext({ style: { color: 'gray' } }, ['- ']),
						wtext({ style: { color: 'gray', fontWeight: 'bold' } }, [
							frame.raw + '\t ',
						]),
					],
					String(index)
				)
			}
			return wbox(
				{},
				[
					wtext({ style: { color: 'gray' } }, ['- ']),
					wtext({ style: { color: 'gray', fontWeight: 'bold' } }, [
						frame.fn ?? '',
					]),
					wtext(
						{
							style: { color: 'gray' },
							'aria-label': `at ${frame.file ?? ''} line ${frame.line} column ${frame.column}`,
						},
						[` (${frame.file ?? ''}:${frame.line}:${frame.column})`]
					),
				],
				String(index)
			)
		})
		children.push(
			wbox({ style: { marginTop: 1, flexDirection: 'column' } }, frameNodes)
		)
	}

	return wbox({ style: { flexDirection: 'column', padding: 1 } }, children)
}
//#endregion Render
