//#region Types
export type IMatchRange = {
	start: number
	end: number
}

export type IFuzzyMatch = {
	score: number
	matchedIndices: number[]
}

export type IFuzzyFilterResult<T extends IFuzzyOption> = {
	option: T
	score: number
	matchRanges: IMatchRange[]
}

export type IFuzzyOption = {
	label: string
	value: string
}
//#endregion Types

//#region Constants
const SCORE_BASE = 1
const BONUS_CONSECUTIVE = 4
const BONUS_BOUNDARY = 10
const BONUS_CAMEL = 7
const FIRST_CHAR_MULTIPLIER = 2
const PENALTY_GAP_START = -3
const PENALTY_GAP_EXTENSION = -1
//#endregion Constants

//#region Helpers
function isWordBoundary(text: string, idx: number): boolean {
	if (idx === 0) return true
	const prev = text[idx - 1]!
	return (
		prev === ' ' || prev === '-' || prev === '_' || prev === '/' || prev === '.'
	)
}

function isCamelBoundary(text: string, idx: number): boolean {
	if (idx === 0) return false
	const prev = text[idx - 1]!
	const curr = text[idx]!
	// lowercase -> uppercase
	if (prev >= 'a' && prev <= 'z' && curr >= 'A' && curr <= 'Z') return true
	// non-digit -> digit (e.g. file2name bonuses at '2')
	if ((prev < '0' || prev > '9') && curr >= '0' && curr <= '9') return true
	return false
}

/**
 * Score a set of matched indices against a label.
 * Applies: base score per char, consecutive bonus, word boundary bonus,
 * camelCase bonus, first-char 2x multiplier, gap penalties.
 */
function scoreIndices(indices: number[], label: string): number {
	let score = 0
	let prevMatchIndex = -2

	for (let qi = 0; qi < indices.length; qi++) {
		const li = indices[qi]!
		let charScore = SCORE_BASE

		if (li === prevMatchIndex + 1) {
			charScore += BONUS_CONSECUTIVE
		}

		if (isWordBoundary(label, li)) {
			charScore += BONUS_BOUNDARY
		}

		if (isCamelBoundary(label, li)) {
			charScore += BONUS_CAMEL
		}

		if (qi === 0) {
			charScore *= FIRST_CHAR_MULTIPLIER
		}

		score += charScore
		prevMatchIndex = li
	}

	// Gap penalty: -3 for gap start, -1 per extension char
	if (indices.length > 1) {
		for (let i = 1; i < indices.length; i++) {
			const gap = indices[i]! - indices[i - 1]! - 1
			if (gap > 0) {
				score += PENALTY_GAP_START
				score += (gap - 1) * PENALTY_GAP_EXTENSION
			}
		}
	}

	return score
}

export function collapseIndices(indices: number[]): IMatchRange[] {
	if (indices.length === 0) return []

	const ranges: IMatchRange[] = []
	let start = indices[0]!
	let end = start + 1

	for (let i = 1; i < indices.length; i++) {
		if (indices[i] === end) {
			end++
		} else {
			ranges.push({ start, end })
			start = indices[i]!
			end = start + 1
		}
	}

	ranges.push({ start, end })
	return ranges
}
//#endregion Helpers

//#region Matching
/**
 * Two-pass fuzzy match (similar to fzf v1):
 * 1. Forward pass — greedy left-to-right character scan
 * 2. Backward pass — tighter alignment from last matched position
 * Scores both passes, returns the best. Case-insensitive.
 */
export function fuzzyMatch(
	query: string,
	label: string
): IFuzzyMatch | undefined {
	if (query.length === 0) {
		return { score: 1, matchedIndices: [] }
	}

	const queryLower = query.toLowerCase()
	const labelLower = label.toLowerCase()

	// Forward pass — find all characters left-to-right
	const forwardIndices: number[] = []
	let qi = 0

	for (let li = 0; li < labelLower.length && qi < queryLower.length; li++) {
		if (labelLower[li] === queryLower[qi]) {
			forwardIndices.push(li)
			qi++
		}
	}

	// All query chars must be found
	if (qi !== queryLower.length) {
		return undefined
	}

	// Backward pass — tighten alignment from the last matched position
	const backwardIndices: number[] = new Array(queryLower.length)
	const lastForwardIndex = forwardIndices[forwardIndices.length - 1]!
	qi = queryLower.length - 1

	for (let li = lastForwardIndex; li >= 0 && qi >= 0; li--) {
		if (labelLower[li] === queryLower[qi]) {
			backwardIndices[qi] = li
			qi--
		}
	}

	// Score both passes and pick the better one
	const forwardScore = scoreIndices(forwardIndices, label)
	const backwardScore = scoreIndices(backwardIndices, label)

	const bestIndices =
		backwardScore >= forwardScore ? backwardIndices : forwardIndices
	const bestScore = Math.max(forwardScore, backwardScore)

	// Normalize to 0..1 range
	// First char: (BASE + CONSECUTIVE + BOUNDARY + CAMEL) * MULTIPLIER = (1+4+10+7)*2 = 44
	// Rest chars: BASE + CONSECUTIVE + BOUNDARY + CAMEL = 22
	const maxFirst =
		(SCORE_BASE + BONUS_CONSECUTIVE + BONUS_BOUNDARY + BONUS_CAMEL) *
		FIRST_CHAR_MULTIPLIER
	const maxRest = SCORE_BASE + BONUS_CONSECUTIVE + BONUS_BOUNDARY + BONUS_CAMEL
	const maxPossible = maxFirst + Math.max(0, query.length - 1) * maxRest
	const normalized = Math.max(0, Math.min(1, bestScore / maxPossible))

	return { score: normalized, matchedIndices: bestIndices }
}
//#endregion Matching

//#region Filter
export function fuzzyFilter<T extends IFuzzyOption>(
	query: string,
	options: T[]
): Array<IFuzzyFilterResult<T>> {
	if (query.length === 0) {
		return options.map((option) => ({
			option,
			score: 1,
			matchRanges: [],
		}))
	}

	const results: Array<IFuzzyFilterResult<T>> = []

	for (const option of options) {
		const match = fuzzyMatch(query, option.label)
		if (match) {
			results.push({
				option,
				score: match.score,
				matchRanges: collapseIndices(match.matchedIndices),
			})
		}
	}

	results.sort((a, b) => b.score - a.score)
	return results
}
//#endregion Filter
