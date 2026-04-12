import { computeViewport } from '../lib/tree-utils'
import type { IViewport } from '../lib/tree-utils'

//#region Types
export type JsonValueType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'null'
	| 'undefined'
	| 'object'
	| 'array'
	| 'date'
	| 'regexp'
	| 'bigint'
	| 'symbol'
	| 'function'
	| 'map'
	| 'set'
	| 'circular'
	| 'max-depth'

export type IJsonNode = {
	id: string
	key: string
	valueType: JsonValueType
	displayValue: string
	depth: number
	hasChildren: boolean
	childCount: number
	isExpandable: boolean
	isClosingBracket: boolean
	bracketChar: string
}

export type IJsonFlattenOptions = {
	maxDepth: number
	maxStringLength: number
	sortKeys: boolean
}

export type JsonViewerState = {
	data: unknown
	flattenOptions: IJsonFlattenOptions
	nodes: IJsonNode[]
	allNodes: IJsonNode[]
	expandedIds: ReadonlySet<string>
	focusedIndex: number
	visibleNodeCount: number
	viewport: IViewport
}

export type JsonViewerAction =
	| { type: 'focus-next' }
	| { type: 'focus-previous' }
	| { type: 'focus-first' }
	| { type: 'focus-last' }
	| { type: 'expand' }
	| { type: 'collapse' }
	| { type: 'toggle-expand' }
	| { type: 'expand-all' }
	| { type: 'collapse-all' }
	| { type: 'move-to-first-child' }
	| { type: 'reset'; state: JsonViewerState }
//#endregion Types

//#region Type Detection
function detectValueType(value: unknown): JsonValueType {
	if (value === null) return 'null'
	if (value === undefined) return 'undefined'

	switch (typeof value) {
		case 'string':
			return 'string'
		case 'number':
			return 'number'
		case 'boolean':
			return 'boolean'
		case 'bigint':
			return 'bigint'
		case 'symbol':
			return 'symbol'
		case 'function':
			return 'function'
		case 'object': {
			if (value instanceof Date) return 'date'
			if (value instanceof RegExp) return 'regexp'
			if (value instanceof Map) return 'map'
			if (value instanceof Set) return 'set'
			if (Array.isArray(value)) return 'array'
			return 'object'
		}
		default:
			return 'object'
	}
}
//#endregion Type Detection

//#region Display Value
function escapeString(s: string): string {
	return s
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/\t/g, '\\t')
}

function formatDisplayValue(
	value: unknown,
	valueType: JsonValueType,
	maxStringLength: number
): string {
	switch (valueType) {
		case 'string': {
			const str = value as string // infrastructure: unknown→string after detectValueType confirmed 'string'
			// Account for surrounding quotes (2 chars)
			const maxRawLength = maxStringLength - 2
			if (str.length > maxRawLength) {
				const truncated =
					maxRawLength <= 3
						? str.slice(0, maxRawLength)
						: str.slice(0, maxRawLength - 3) + '...'
				return `"${escapeString(truncated)}"`
			}
			return `"${escapeString(str)}"`
		}
		case 'number':
			return String(value)
		case 'boolean':
			return String(value)
		case 'null':
			return 'null'
		case 'undefined':
			return 'undefined'
		case 'date':
			return (value as Date).toISOString() // infrastructure: unknown→Date after detectValueType confirmed 'date'
		case 'regexp':
			return String(value)
		case 'bigint':
			return `${String(value)}n`
		case 'symbol':
			return String(value)
		case 'function': {
			const fn = value as (...args: unknown[]) => unknown // infrastructure: unknown→fn after detectValueType confirmed 'function'
			return `[Function: ${fn.name || 'anonymous'}]`
		}
		case 'object': {
			const obj = value as Record<string, unknown> // infrastructure: unknown→Record after detectValueType confirmed 'object'
			const keyCount = Object.keys(obj).length
			return keyCount === 0 ? '{}' : `{${keyCount} keys}`
		}
		case 'array': {
			const arr = value as unknown[] // infrastructure: unknown→array after detectValueType confirmed 'array'
			return arr.length === 0 ? '[]' : `[${arr.length} items]`
		}
		case 'map': {
			const map = value as Map<unknown, unknown> // infrastructure: unknown→Map after detectValueType confirmed 'map'
			return `Map(${map.size})`
		}
		case 'set': {
			const set = value as Set<unknown> // infrastructure: unknown→Set after detectValueType confirmed 'set'
			return `Set(${set.size})`
		}
		case 'circular':
			return '[Circular]'
		case 'max-depth':
			return '[Max depth]'
	}
}

function getChildCount(value: unknown, valueType: JsonValueType): number {
	switch (valueType) {
		case 'object': {
			const obj = value as Record<string, unknown> // infrastructure: narrowing after type check
			return Object.keys(obj).length
		}
		case 'array': {
			const arr = value as unknown[] // infrastructure: narrowing after type check
			return arr.length
		}
		case 'map': {
			const map = value as Map<unknown, unknown> // infrastructure: narrowing after type check
			return map.size
		}
		case 'set': {
			const set = value as Set<unknown> // infrastructure: narrowing after type check
			return set.size
		}
		default:
			return 0
	}
}
//#endregion Display Value

//#region Flatten
const SIMPLE_IDENTIFIER_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

function buildPath(
	parentId: string | undefined,
	key: string | number | undefined
): string {
	if (parentId === undefined) {
		return '$'
	}
	if (typeof key === 'number') {
		return `${parentId}[${key}]`
	}
	const k = key ?? ''
	if (SIMPLE_IDENTIFIER_RE.test(k)) {
		return `${parentId}.${k}`
	}
	return `${parentId}["${escapeString(k)}"]`
}

function getContainerEntries(
	value: unknown,
	valueType: JsonValueType,
	sortKeys: boolean
): Array<{ key: string | number; childValue: unknown }> {
	const entries: Array<{ key: string | number; childValue: unknown }> = []

	switch (valueType) {
		case 'object': {
			const obj = value as Record<string, unknown> // infrastructure: narrowing after type check
			let keys = Object.keys(obj)
			if (sortKeys) {
				keys = keys.slice().sort()
			}
			for (const k of keys) {
				entries.push({ key: k, childValue: obj[k] })
			}
			break
		}
		case 'array': {
			const arr = value as unknown[] // infrastructure: narrowing after type check
			for (let i = 0; i < arr.length; i++) {
				entries.push({ key: i, childValue: arr[i] })
			}
			break
		}
		case 'map': {
			const map = value as Map<unknown, unknown> // infrastructure: narrowing after type check
			for (const [k, v] of map) {
				entries.push({ key: String(k), childValue: v })
			}
			break
		}
		case 'set': {
			const set = value as Set<unknown> // infrastructure: narrowing after type check
			let idx = 0
			for (const v of set) {
				entries.push({ key: idx, childValue: v })
				idx++
			}
			break
		}
	}

	return entries
}

function closingBracketFor(valueType: JsonValueType): string {
	if (valueType === 'array' || valueType === 'set') return ']'
	return '}'
}

function flattenValue(
	value: unknown,
	key: string | number,
	depth: number,
	path: string,
	expandedIds: ReadonlySet<string>,
	seen: Set<object>,
	options: IJsonFlattenOptions
): IJsonNode[] {
	const result: IJsonNode[] = []

	const keyStr = String(key)

	// Circular reference detection — only for reference types
	if (typeof value === 'object' && value !== null) {
		if (seen.has(value)) {
			result.push({
				id: path,
				key: keyStr,
				valueType: 'circular',
				displayValue: '[Circular]',
				depth,
				hasChildren: false,
				childCount: 0,
				isExpandable: false,
				isClosingBracket: false,
				bracketChar: '',
			})
			return result
		}
	}

	// Max depth check
	if (depth > options.maxDepth) {
		result.push({
			id: path,
			key: keyStr,
			valueType: 'max-depth',
			displayValue: '[Max depth]',
			depth,
			hasChildren: false,
			childCount: 0,
			isExpandable: false,
			isClosingBracket: false,
			bracketChar: '',
		})
		return result
	}

	const valueType = detectValueType(value)
	const isContainer =
		valueType === 'object' ||
		valueType === 'array' ||
		valueType === 'map' ||
		valueType === 'set'
	const childCount = isContainer ? getChildCount(value, valueType) : 0
	const hasChildren = childCount > 0
	const isExpandable = hasChildren

	const node: IJsonNode = {
		id: path,
		key: keyStr,
		valueType,
		displayValue: formatDisplayValue(value, valueType, options.maxStringLength),
		depth,
		hasChildren,
		childCount,
		isExpandable,
		isClosingBracket: false,
		bracketChar: '',
	}

	result.push(node)

	// Recurse into children if expanded
	if (isContainer && hasChildren && expandedIds.has(path)) {
		const nextSeen = new Set(seen)
		if (typeof value === 'object' && value !== null) {
			nextSeen.add(value)
		}

		const entries = getContainerEntries(value, valueType, options.sortKeys)
		for (const entry of entries) {
			const childPath = buildPath(path, entry.key)
			const childNodes = flattenValue(
				entry.childValue,
				entry.key,
				depth + 1,
				childPath,
				expandedIds,
				nextSeen,
				options
			)
			for (const childNode of childNodes) {
				result.push(childNode)
			}
		}

		// Insert closing bracket node after all children
		result.push({
			id: `${path}__close`,
			key: '',
			valueType,
			displayValue: closingBracketFor(valueType),
			depth,
			hasChildren: false,
			childCount: 0,
			isExpandable: false,
			isClosingBracket: true,
			bracketChar: closingBracketFor(valueType),
		})
	}

	return result
}

function collectAllExpandableIds(nodes: IJsonNode[]): Set<string> {
	const ids = new Set<string>()
	for (const node of nodes) {
		if (node.isExpandable) {
			ids.add(node.id)
		}
	}
	return ids
}
//#endregion Flatten

//#region Helpers
function rebuildNodes(
	data: unknown,
	expandedIds: ReadonlySet<string>,
	options: IJsonFlattenOptions
): IJsonNode[] {
	return flattenValue(data, '$', 0, '$', expandedIds, new Set(), options)
}

function findParentId(nodeId: string): string | undefined {
	// Strip __close suffix if present
	const cleanId = nodeId.endsWith('__close') ? nodeId.slice(0, -7) : nodeId
	// Find last `.` or `[` boundary (whichever is later)
	const lastDot = cleanId.lastIndexOf('.')
	const lastBracket = cleanId.lastIndexOf('[')
	const boundary = Math.max(lastDot, lastBracket)
	if (boundary <= 0) return undefined
	return cleanId.slice(0, boundary)
}

function reflattenAndViewport(
	state: JsonViewerState,
	expandedIds: ReadonlySet<string>,
	focusedIndex: number
): Pick<
	JsonViewerState,
	'nodes' | 'expandedIds' | 'viewport' | 'focusedIndex'
> {
	const nodes = rebuildNodes(state.data, expandedIds, state.flattenOptions)
	const clampedIndex = Math.min(
		Math.max(0, focusedIndex),
		Math.max(0, nodes.length - 1)
	)
	const viewport = computeViewport(
		nodes.length,
		clampedIndex,
		state.visibleNodeCount,
		state.viewport
	)

	return { nodes, expandedIds, viewport, focusedIndex: clampedIndex }
}
//#endregion Helpers

//#region Reducer
export function jsonViewerReducer(
	state: JsonViewerState,
	action: JsonViewerAction
): JsonViewerState {
	switch (action.type) {
		case 'focus-next': {
			let nextIndex = state.focusedIndex + 1
			// Skip closing bracket nodes
			while (
				nextIndex < state.nodes.length &&
				state.nodes[nextIndex]!.isClosingBracket
			) {
				nextIndex++
			}
			if (nextIndex >= state.nodes.length) {
				return state
			}

			const viewport = computeViewport(
				state.nodes.length,
				nextIndex,
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedIndex: nextIndex, viewport }
		}

		case 'focus-previous': {
			let prevIndex = state.focusedIndex - 1
			// Skip closing bracket nodes
			while (prevIndex >= 0 && state.nodes[prevIndex]!.isClosingBracket) {
				prevIndex--
			}
			if (prevIndex < 0) {
				return state
			}

			const viewport = computeViewport(
				state.nodes.length,
				prevIndex,
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedIndex: prevIndex, viewport }
		}

		case 'focus-first': {
			if (state.nodes.length === 0) return state

			const viewport = computeViewport(
				state.nodes.length,
				0,
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedIndex: 0, viewport }
		}

		case 'focus-last': {
			if (state.nodes.length === 0) return state

			// Find last non-closing-bracket node
			let lastIndex = state.nodes.length - 1
			while (lastIndex >= 0 && state.nodes[lastIndex]!.isClosingBracket) {
				lastIndex--
			}
			if (lastIndex < 0) return state

			const viewport = computeViewport(
				state.nodes.length,
				lastIndex,
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedIndex: lastIndex, viewport }
		}

		case 'expand': {
			const focused = state.nodes[state.focusedIndex]
			if (!focused || !focused.isExpandable) return state
			if (state.expandedIds.has(focused.id)) return state

			const nextExpanded = new Set(state.expandedIds)
			nextExpanded.add(focused.id)

			return {
				...state,
				...reflattenAndViewport(state, nextExpanded, state.focusedIndex),
			}
		}

		case 'collapse': {
			const focused = state.nodes[state.focusedIndex]
			if (!focused) return state

			// Focused node is expanded — collapse it
			if (state.expandedIds.has(focused.id)) {
				const nextExpanded = new Set(state.expandedIds)
				nextExpanded.delete(focused.id)

				return {
					...state,
					...reflattenAndViewport(state, nextExpanded, state.focusedIndex),
				}
			}

			// Focused node is not expanded — find parent, focus + collapse parent
			const parentId = findParentId(focused.id)
			if (parentId === undefined) return state

			const parentIndex = state.nodes.findIndex((n) => n.id === parentId)
			if (parentIndex < 0) return state

			const nextExpanded = new Set(state.expandedIds)
			nextExpanded.delete(parentId)

			return {
				...state,
				...reflattenAndViewport(state, nextExpanded, parentIndex),
			}
		}

		case 'toggle-expand': {
			const focused = state.nodes[state.focusedIndex]
			if (!focused) return state

			if (state.expandedIds.has(focused.id)) {
				return jsonViewerReducer(state, { type: 'collapse' })
			}

			return jsonViewerReducer(state, { type: 'expand' })
		}

		case 'expand-all': {
			const allExpandable = collectAllExpandableIds(state.allNodes)

			return {
				...state,
				...reflattenAndViewport(state, allExpandable, state.focusedIndex),
			}
		}

		case 'collapse-all': {
			const emptySet: ReadonlySet<string> = new Set()

			return {
				...state,
				...reflattenAndViewport(state, emptySet, 0),
			}
		}

		case 'move-to-first-child': {
			const focused = state.nodes[state.focusedIndex]
			if (!focused || !focused.isExpandable) return state
			if (!state.expandedIds.has(focused.id)) return state

			// First child is the next non-closing-bracket node after the focused one
			let childIndex = state.focusedIndex + 1
			while (
				childIndex < state.nodes.length &&
				state.nodes[childIndex]!.isClosingBracket
			) {
				childIndex++
			}
			if (childIndex >= state.nodes.length) return state

			const viewport = computeViewport(
				state.nodes.length,
				childIndex,
				state.visibleNodeCount,
				state.viewport
			)

			return { ...state, focusedIndex: childIndex, viewport }
		}

		case 'reset': {
			return action.state
		}

		default:
			return state
	}
}
//#endregion Reducer

//#region Factory
export function createDefaultJsonViewerState(options: {
	data: unknown
	defaultExpandDepth?: number
	visibleNodeCount?: number
	maxStringLength?: number
	sortKeys?: boolean
	maxDepth?: number
}): JsonViewerState {
	const defaultExpandDepth = options.defaultExpandDepth ?? 1
	const visibleNodeCount = options.visibleNodeCount ?? 20
	const flattenOptions: IJsonFlattenOptions = {
		maxDepth: options.maxDepth ?? 100,
		maxStringLength: options.maxStringLength ?? 120,
		sortKeys: options.sortKeys ?? false,
	}

	// First pass: collect all expandable IDs via recursive scan, then flatten
	// with all expanded to get allNodes
	const allExpandableIds = collectAllExpandablePaths(
		options.data,
		'$',
		0,
		new Set(),
		flattenOptions
	)
	const allExpandedPass = rebuildNodes(
		options.data,
		allExpandableIds,
		flattenOptions
	)

	// Compute default expanded: container nodes with depth < defaultExpandDepth
	const defaultExpanded = new Set<string>()
	for (const node of allExpandedPass) {
		if (node.isExpandable && node.depth < defaultExpandDepth) {
			defaultExpanded.add(node.id)
		}
	}

	// Second pass: flatten with only default expanded nodes
	const nodes = rebuildNodes(options.data, defaultExpanded, flattenOptions)

	const viewport = computeViewport(nodes.length, 0, visibleNodeCount, {
		fromIndex: 0,
		toIndex: 0,
	})

	return {
		data: options.data,
		flattenOptions,
		nodes,
		allNodes: allExpandedPass,
		expandedIds: defaultExpanded,
		focusedIndex: 0,
		visibleNodeCount,
		viewport,
	}
}
//#endregion Factory

//#region Collect All Expandable
/**
 * Recursively scans the value tree to collect all paths that are expandable containers.
 * Used to build the "all nodes" view without needing an infinite-set trick.
 */
function collectAllExpandablePaths(
	value: unknown,
	path: string,
	depth: number,
	seen: Set<object>,
	options: IJsonFlattenOptions
): Set<string> {
	const ids = new Set<string>()

	if (depth > options.maxDepth) return ids
	if (typeof value === 'object' && value !== null && seen.has(value)) return ids

	const valueType = detectValueType(value)
	const isContainer =
		valueType === 'object' ||
		valueType === 'array' ||
		valueType === 'map' ||
		valueType === 'set'

	if (!isContainer) return ids

	const childCount = getChildCount(value, valueType)
	if (childCount === 0) return ids

	ids.add(path)

	const nextSeen = new Set(seen)
	if (typeof value === 'object' && value !== null) {
		nextSeen.add(value)
	}

	const entries = getContainerEntries(value, valueType, options.sortKeys)
	for (const entry of entries) {
		const childPath = buildPath(path, entry.key)
		const childIds = collectAllExpandablePaths(
			entry.childValue,
			childPath,
			depth + 1,
			nextSeen,
			options
		)
		for (const childId of childIds) {
			ids.add(childId)
		}
	}

	return ids
}
//#endregion Collect All Expandable

//#region Path Resolution
/**
 * Resolve the actual value at a JSONPath from the root data.
 * Path format: "$", "$.key", "$[0]", "$[\"special.key\"]"
 */
export function resolvePathValue(data: unknown, path: string): unknown {
	if (path === '$') return data

	// Parse path segments: $.foo.bar[0]["key.with.dots"]
	const segments: Array<string | number> = []
	let i = 1 // skip leading '$'

	while (i < path.length) {
		if (path[i] === '.') {
			// Dot notation: .identifier
			i++
			let key = ''
			while (i < path.length && path[i] !== '.' && path[i] !== '[') {
				key += path[i]
				i++
			}
			segments.push(key)
		} else if (path[i] === '[') {
			i++ // skip '['
			if (path[i] === '"') {
				// Bracket with string key: ["key"]
				i++ // skip '"'
				let key = ''
				while (i < path.length && path[i] !== '"') {
					if (path[i] === '\\' && i + 1 < path.length) {
						i++ // skip backslash
					}
					key += path[i]
					i++
				}
				i++ // skip closing '"'
				i++ // skip closing ']'
				segments.push(key)
			} else {
				// Bracket with number index: [0]
				let num = ''
				while (i < path.length && path[i] !== ']') {
					num += path[i]
					i++
				}
				i++ // skip ']'
				segments.push(Number(num))
			}
		} else {
			i++
		}
	}

	let current: unknown = data
	for (const seg of segments) {
		if (current === null || current === undefined) return undefined
		if (current instanceof Map) {
			current = current.get(String(seg))
		} else if (current instanceof Set) {
			const arr = [...current]
			current = typeof seg === 'number' ? arr[seg] : undefined
		} else if (typeof current === 'object') {
			current = (current as Record<string, unknown>)[String(seg)] // infrastructure: dynamic property access after object check
		} else {
			return undefined
		}
	}

	return current
}
//#endregion Path Resolution
