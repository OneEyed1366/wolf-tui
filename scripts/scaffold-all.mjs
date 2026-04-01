import {
	compose,
	renderProject,
	isSupported,
} from './packages/create-wolf-tui/dist/index.mjs'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

rmSync('scaffolds', { recursive: true, force: true })

const fws = ['react', 'vue', 'angular', 'solid', 'svelte']
const bs = ['vite', 'webpack', 'esbuild']
const css = [
	{ tailwind: false, cssPreprocessor: undefined, label: 'plain' },
	{ tailwind: true, label: 'tailwind' },
	{ tailwind: false, cssPreprocessor: 'sass', label: 'sass' },
	{ tailwind: true, cssPreprocessor: 'sass', label: 'tailwind_sass' },
	{ tailwind: false, cssPreprocessor: 'less', label: 'less' },
	{ tailwind: false, cssPreprocessor: 'stylus', label: 'stylus' },
]

let c = 0
for (const fw of fws)
	for (const b of bs) {
		if (!isSupported(fw, b)) continue
		for (const s of css)
			for (const lint of [false, true]) {
				const p = [fw, b, s.label]
				if (lint) p.push('lint')
				const n = p.join('_')
				const config = {
					name: n,
					framework: fw,
					bundler: b,
					tailwind: !!s.tailwind,
					cssPreprocessor: s.cssPreprocessor,
					lint,
					git: false,
					install: false,
					targetDir: resolve('scaffolds', n),
				}
				renderProject(compose(config), config.targetDir)
				c++
			}
	}

console.log(c + ' scaffolded')
