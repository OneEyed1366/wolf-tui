//#region Types

interface Processed {
	code: string
	map?: undefined
}

interface PreprocessorGroup {
	name: string
	markup: (options: { content: string; filename?: string }) => Processed | void
}

//#endregion Types

//#region Class Extraction

/**
 * Extract static class names from `class` and `className` props on Component nodes.
 *
 * Component nodes = tags starting with uppercase (Box, Text, Alert, etc).
 * Only static string values are captured — dynamic expressions ({expr}) are skipped
 * because their runtime values can't be known at compile time.
 */
function extractComponentClasses(markup: string): Set<string> {
	const classes = new Set<string>()

	// Match component tags: <Uppercase... class="..." or className="..."
	// Captures the full opening tag to find class/className props within it
	const componentTagRe =
		/<([A-Z][A-Za-z0-9]*)\b([^>]*?)\/?>|<([A-Z][A-Za-z0-9]*)\b([^>]*?)>/g

	let tagMatch: RegExpExecArray | null
	while ((tagMatch = componentTagRe.exec(markup)) !== null) {
		const attrs = tagMatch[2] ?? tagMatch[4] ?? ''

		// Find class="..." or className="..." with static string values
		const classAttrRe =
			/(?:class|className)\s*=\s*(?:"([^"]*?)"|'([^']*?)'|{`([^`]*?)`})/g
		let attrMatch: RegExpExecArray | null
		while ((attrMatch = classAttrRe.exec(attrs)) !== null) {
			const value = attrMatch[1] ?? attrMatch[2] ?? attrMatch[3] ?? ''
			// Split on whitespace, filter empties
			for (const cls of value.split(/\s+/)) {
				if (cls) classes.add(cls)
			}
		}
	}

	return classes
}

//#endregion Class Extraction

//#region Preprocessor

/**
 * Svelte preprocessor that prevents CSS pruning of selectors used on Component nodes.
 *
 * Svelte's CSS pruner only checks RegularElement (native HTML) nodes for class usage.
 * Components (<Box>, <Text>) are opaque — the pruner can't see their `class` props.
 * This means `<style>` selectors targeting component classes get pruned as "unused."
 *
 * Fix: inject a hidden `{#if false}<div class="all-classes"></div>{/if}` element.
 * The pruner sees the div (a RegularElement), recognizes the classes, and preserves them.
 * The `{#if false}` ensures the div is never rendered.
 */
export function wolfiePreprocess(): PreprocessorGroup {
	return {
		name: 'wolfie-css-preserve',

		markup({ content }) {
			const classes = extractComponentClasses(content)

			if (classes.size === 0) return

			// Build the hidden element with all discovered classes
			const classList = [...classes].join(' ')
			const sentinel = `{#if false}<div class="${classList}"></div>{/if}`

			// Insert before the first <style> block (or at end of markup if none)
			const styleIndex = content.search(/<style[\s>]/)
			const insertIndex = styleIndex !== -1 ? styleIndex : content.length

			const code =
				content.slice(0, insertIndex) +
				`\n<!-- wolfie: preserve CSS selectors used on components -->\n${sentinel}\n` +
				content.slice(insertIndex)

			return { code }
		},
	}
}

//#endregion Preprocessor
