/**
 * Extracts @utility blocks from raw CSS before Tailwind/PostCSS processing.
 *
 * Tailwind v4's @utility directive defines custom utilities:
 *   @utility border-round { border-style: round; }
 *
 * The wolfie plugin reads raw CSS files (not PostCSS output), so @utility
 * blocks must be extracted separately. This parser handles simple (non-functional)
 * utilities — functional utilities (@utility name-* { --value() }) are phase 2.
 *
 * Both Tailwind and wolfie consume the same @utility blocks:
 *   - Tailwind: generates CSS classes for the utility layer
 *   - wolfie: extracts style mappings for inline resolution
 */

import type { Styles } from '@wolf-tui/core'
import type { ParsedStyles } from './types'
import { mapCSSProperty } from './properties'

//#region @utility Parser

const UTILITY_BLOCK_RE = /@utility\s+([\w-]+)\s*\{([^}]+)\}/g

/**
 * Extract @utility blocks from raw CSS and convert to ParsedStyles.
 *
 * Skips functional utilities (name contains `*`) — those require --value() resolution
 * which is handled by Tailwind's PostCSS engine, not wolfie.
 */
export function extractUtilities(rawCss: string): ParsedStyles {
	const result: ParsedStyles = {}

	for (const match of rawCss.matchAll(UTILITY_BLOCK_RE)) {
		const name = match[1]!
		const block = match[2]!

		// Skip functional utilities (e.g., @utility tab-* { ... })
		if (name.includes('*')) continue

		const style: Partial<Styles> = {}

		for (const decl of block.split(';')) {
			const colonIdx = decl.indexOf(':')
			if (colonIdx === -1) continue

			const prop = decl.slice(0, colonIdx).trim()
			const value = decl.slice(colonIdx + 1).trim()

			if (!prop || !value) continue

			// Skip Tailwind --value() / --modifier() functions (functional utilities)
			if (value.includes('--value(') || value.includes('--modifier(')) continue

			const mapped = mapCSSProperty(prop, value)
			if (mapped) Object.assign(style, mapped)
		}

		if (Object.keys(style).length > 0) {
			result[name] = style
		}
	}

	return result
}

//#endregion @utility Parser
