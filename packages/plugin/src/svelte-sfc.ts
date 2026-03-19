/**
 * Svelte SFC Style Plugin for wolfie
 *
 * Intercepts Svelte's virtual style modules (`?svelte&type=style&lang.css`)
 * and processes them through the wolfie CSS pipeline instead of Vite's CSS pipeline.
 *
 * Same pattern as vue-sfc.ts:
 * 1. resolveId: redirect `?svelte&type=style` → virtual `.js` module
 * 2. load: extract `<style>` from `.svelte` file, compile preprocessor, parse to styles, return JS
 */
import type { Plugin } from 'vite'
import { compile, parseCSS } from '@wolfie/css-parser'

const WOLFIE_SVELTE_STYLE_PREFIX = '\x00wolfie-svelte-style:'

//#region Helpers

/**
 * Extract the `<style>` block from a Svelte component source.
 * Svelte allows only one `<style>` block per component.
 */
function extractSvelteStyle(content: string): {
	content: string
	lang: string
} | null {
	const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/i
	const match = styleRegex.exec(content)
	if (!match) return null

	const attrs = match[1] || ''
	const styleContent = match[2] || ''

	const langMatch = attrs.match(/lang=["']?(\w+)["']?/)
	const lang = langMatch?.[1] || 'css'

	return {
		content: styleContent.trim(),
		lang,
	}
}

//#endregion Helpers

//#region SFC Style Plugin

/**
 * Svelte SFC style handler — redirects Svelte style virtual modules to JavaScript.
 *
 * vite-plugin-svelte compiles `.svelte` files and injects:
 *   `import "Component.svelte?svelte&type=style&lang.css"`
 *
 * This plugin intercepts that import (enforce: 'pre'), reads the raw `.svelte` file,
 * extracts the `<style>` block, compiles SCSS/LESS/Stylus, parses through wolfie CSS,
 * and returns a JS module that registers terminal styles.
 */
export function createSvelteSfcPlugin(): Plugin {
	return {
		name: 'wolfie:svelte-sfc',
		enforce: 'pre',

		resolveId(id) {
			// Intercept Svelte virtual style modules
			if (id.includes('?svelte') && id.includes('type=style')) {
				const encoded = Buffer.from(id).toString('base64')
				return WOLFIE_SVELTE_STYLE_PREFIX + encoded + '.js'
			}
			return null
		},

		async load(id) {
			if (!id.startsWith(WOLFIE_SVELTE_STYLE_PREFIX)) return null

			const { readFileSync } = await import('node:fs')

			// Decode the original virtual module ID
			const encoded = id
				.slice(WOLFIE_SVELTE_STYLE_PREFIX.length)
				.replace(/\.js$/, '')
			const originalId = Buffer.from(encoded, 'base64').toString('utf-8')

			// Extract file path from virtual ID
			// Format: /path/to/Component.svelte?svelte&type=style&lang.css
			const filePath = originalId.split('?')[0]!

			// Read the raw .svelte source and extract <style> block
			let svelteContent: string
			try {
				svelteContent = readFileSync(filePath, 'utf-8')
			} catch {
				return { code: 'export default {}', map: null }
			}

			const styleBlock = extractSvelteStyle(svelteContent)
			if (!styleBlock || !styleBlock.content) {
				return { code: 'export default {}', map: null }
			}

			// Compile preprocessor (SCSS/LESS/Stylus → CSS)
			const cssLang = (
				styleBlock.lang === 'sass' || styleBlock.lang === 'scss'
					? 'scss'
					: styleBlock.lang === 'styl' || styleBlock.lang === 'stylus'
						? 'stylus'
						: styleBlock.lang === 'less'
							? 'less'
							: 'css'
			) satisfies 'css' | 'scss' | 'less' | 'stylus'

			const compiled = await compile(styleBlock.content, cssLang, filePath)

			// Parse CSS to wolfie terminal styles
			const styles = parseCSS(compiled.css, {
				filename: filePath,
				camelCaseClasses: false,
			})

			// Return JS module that registers styles in wolfie runtime
			const stylesJson = JSON.stringify(styles)

			return {
				code: `import { registerStyles } from '@wolfie/svelte'
const styles = ${stylesJson}
registerStyles(styles)
export default styles`,
				map: null,
			}
		},
	}
}

//#endregion SFC Style Plugin
