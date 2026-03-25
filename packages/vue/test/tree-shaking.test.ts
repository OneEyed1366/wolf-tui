import { build } from 'esbuild'
import { build as viteBuild } from 'vite'
import webpack from 'webpack'
import { test, expect } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import type { PluginOption } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VUE_ENTRY = path.resolve(__dirname, '../build/index.js')

// --- Helpers ---

async function getBundleEsbuild(code: string) {
	const result = await build({
		stdin: {
			contents: code,
			resolveDir: __dirname,
			loader: 'js',
		},
		bundle: true,
		write: false,
		format: 'esm',
		platform: 'node',
		treeShaking: true,
		plugins: [
			{
				name: 'resolve-wolfie-vue',
				setup(build) {
					build.onResolve({ filter: /^@wolf-tui\/vue$/ }, () => {
						return { path: VUE_ENTRY }
					})
				},
			},
		],
		external: [
			'vue',
			'@wolf-tui/core',
			'@wolf-tui/css-parser',
			'yoga-wasm-web',
			'ws',
			'node-pty',
			'ansi-escapes',
			'ansi-styles',
			'auto-bind',
			'cli-boxes',
			'cli-cursor',
			'cli-truncate',
			'code-excerpt',
			'es-toolkit',
			'indent-string',
			'is-in-ci',
			'patch-console',
			'signal-exit',
			'stack-utils',
			'type-fest',
			'wrap-ansi',
			'node:stream',
			'node:process',
			'node:events',
			'node:fs',
			'node:module',
			'node:os',
			'node:tty',
			'node:path',
			'node:url',
			'node:util',
		],
	})
	return result.outputFiles[0].text
}

async function getBundleVite(code: string) {
	const result = (await viteBuild({
		logLevel: 'warn',
		ssr: {
			noExternal: true,
			target: 'node',
		},
		build: {
			write: false,
			minify: false,
			ssr: true,
			rollupOptions: {
				external: [
					'vue',
					'@wolf-tui/core',
					'@wolf-tui/css-parser',
					'yoga-wasm-web',
					'ws',
					'node-pty',
					'ansi-escapes',
					'ansi-styles',
					'auto-bind',
					'cli-boxes',
					'cli-cursor',
					'cli-truncate',
					'code-excerpt',
					'es-toolkit',
					'indent-string',
					'is-in-ci',
					'patch-console',
					'signal-exit',
					'stack-utils',
					'type-fest',
					'wrap-ansi',
					'node:stream',
					'node:process',
					'node:events',
					'node:fs',
					'node:module',
					'node:os',
					'node:tty',
					'node:path',
					'node:url',
					'node:util',
				],
				input: 'entry.js',
				output: {
					format: 'esm',
				},
			},
		},
		plugins: [
			{
				name: 'virtual-entry',
				resolveId(id) {
					if (id === 'entry.js') return id
					if (id === '@wolf-tui/vue') return VUE_ENTRY
				},
				load(id) {
					if (id === 'entry.js') return code
				},
			} as PluginOption,
		],
	})) as any

	return Array.isArray(result)
		? result[0].output[0].code
		: (result as any).output
			? (result as any).output[0].code
			: ''
}

async function getBundleWebpack(code: string) {
	const entryPath = path.resolve(__dirname, 'temp_entry_vue.js')
	const outputPath = path.resolve(__dirname, 'temp_bundle_vue.js')

	fs.writeFileSync(entryPath, code)

	try {
		const compiler = webpack({
			mode: 'production',
			target: 'node',
			entry: entryPath,
			output: {
				path: __dirname,
				filename: 'temp_bundle_vue.js',
				module: true,
				library: { type: 'module' },
			},
			experiments: {
				outputModule: true,
			},
			optimization: {
				minimize: false,
				usedExports: true,
				sideEffects: true,
				innerGraph: true,
			},
			resolve: {
				alias: {
					'@wolf-tui/vue': VUE_ENTRY,
				},
				extensions: ['.js', '.mjs'],
			},
			externals: [
				({ request }, callback) => {
					const externals = [
						'vue',
						'@wolf-tui/core',
						'@wolf-tui/css-parser',
						'yoga-wasm-web',
						'ws',
						'node-pty',
						'ansi-escapes',
						'ansi-styles',
						'auto-bind',
						'cli-boxes',
						'cli-cursor',
						'cli-truncate',
						'code-excerpt',
						'es-toolkit',
						'indent-string',
						'is-in-ci',
						'patch-console',
						'signal-exit',
						'stack-utils',
						'type-fest',
						'wrap-ansi',
						'chalk',
						'@wolf-tui/shared',
					]
					if (
						externals.some((e) => request?.startsWith(e)) ||
						request?.startsWith('node:')
					) {
						return callback(null, `import ${request}`)
					}
					callback()
				},
			],
			externalsType: 'module',
		})

		return await new Promise<string>((resolve, reject) => {
			compiler.run((err, stats) => {
				if (err) return reject(err)
				if (stats?.hasErrors())
					return reject(new Error(stats.toString({ colors: true })))

				const output = fs.readFileSync(outputPath, 'utf-8')
				resolve(output)
			})
		})
	} finally {
		if (fs.existsSync(entryPath)) fs.unlinkSync(entryPath)
		if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
	}
}

// --- Tests ---

const bundlers = [
	{ name: 'esbuild', fn: getBundleEsbuild },
	{ name: 'vite', fn: getBundleVite },
	{ name: 'webpack', fn: getBundleWebpack },
]

bundlers.forEach(({ name, fn }) => {
	test.concurrent(
		`[${name}] should tree-shake unused components (Box)`,
		async () => {
			const code = `
      import { Box } from '@wolf-tui/vue';
      console.log(Box);
    `
			const bundle = await fn(code)

			expect(bundle).not.toContain('MultiSelect')
			expect(bundle).not.toContain('PasswordInput')
			expect(bundle).not.toContain('Spinner')
		}
	)

	test.concurrent(
		`[${name}] should tree-shake unused components (Text)`,
		async () => {
			const code = `
      import { Text } from '@wolf-tui/vue';
      console.log(Text);
    `
			const bundle = await fn(code)

			expect(bundle).not.toContain('MultiSelect')
			expect(bundle).not.toContain('PasswordInput')
		}
	)
})
