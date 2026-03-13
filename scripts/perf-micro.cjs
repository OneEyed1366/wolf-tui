/**
 * Micro-benchmark: WNode render-function pipeline across all adapters.
 *
 * Measures:
 *   1. renderXxx(state, theme) → WNode (shared, framework-agnostic)
 *   2. wNodeToXxx(wnode) → framework element (React, Vue)
 *   3. Full pipeline overhead vs direct createElement/h() baseline
 *
 * Solid and Angular adapters create real wolfie DOM nodes (not POJOs)
 * so they are not comparable with React/Vue in a headless benchmark.
 * The shared render-function stage is framework-agnostic and benchmarked
 * for all component types.
 *
 * Usage: node scripts/perf-micro.cjs
 */

'use strict'

const { performance } = require('perf_hooks')

//#region Stats
function stats(samples) {
	const sorted = [...samples].sort((a, b) => a - b)
	const n = sorted.length
	const sum = sorted.reduce((a, b) => a + b, 0)
	return {
		mean: sum / n,
		min: sorted[0],
		max: sorted[n - 1],
		p50: sorted[Math.floor(n * 0.5)],
		p95: sorted[Math.floor(n * 0.95)],
		p99: sorted[Math.floor(n * 0.99)],
	}
}

function formatStats(s) {
	const µs = (ms) => (ms * 1000).toFixed(3)
	return (
		`mean=${µs(s.mean)}µs  min=${µs(s.min)}µs  p50=${µs(s.p50)}µs  ` +
		`p95=${µs(s.p95)}µs  p99=${µs(s.p99)}µs  max=${µs(s.max)}µs`
	)
}
//#endregion Stats

//#region Bench runner
/**
 * Runs fn for DURATION_MS ms, returns per-call latency samples.
 * Measures in batches of BATCH_SIZE to amortize hrtime overhead.
 */
function bench(
	name,
	fn,
	{ warmup = 2000, batches = 100, batchSize = 500 } = {}
) {
	// Warmup (JIT)
	for (let i = 0; i < warmup; i++) fn()

	const samples = []
	for (let b = 0; b < batches; b++) {
		const t0 = performance.now()
		for (let i = 0; i < batchSize; i++) fn()
		const t1 = performance.now()
		// per-call time in ms
		samples.push((t1 - t0) / batchSize)
	}

	const s = stats(samples)
	const opsPerSec = Math.round(1 / (s.mean / 1000))
	console.log(
		`  ${name.padEnd(42)} ${formatStats(s)}  ops/s=${opsPerSec.toLocaleString()}`
	)
	return s
}
//#endregion Bench runner

//#region Select state fixture
const FIVE_OPTIONS = [
	{ label: 'Start Game', value: 'start' },
	{ label: 'High Scores', value: 'highscores' },
	{ label: 'Settings', value: 'settings' },
	{ label: 'Help', value: 'help' },
	{ label: 'Quit', value: 'quit' },
]

const SELECT_STATE = {
	visibleOptions: FIVE_OPTIONS,
	focusedValue: 'settings',
	value: 'start',
	isDisabled: false,
	highlightText: undefined,
}

const MULTI_SELECT_STATE = {
	visibleOptions: FIVE_OPTIONS,
	focusedValue: 'settings',
	value: ['start', 'help'],
	isDisabled: false,
	highlightText: undefined,
}
//#endregion Select state fixture

async function main() {
	//#region Imports (ESM via dynamic import)
	const shared = await import('../internal/shared/build/index.js')
	const {
		renderSelect,
		defaultSelectTheme,
		renderMultiSelect,
		defaultMultiSelectTheme,
		renderSpinner,
		defaultSpinnerTheme,
		renderTextInput,
		defaultTextInputTheme,
		renderConfirmInput,
		defaultConfirmInputTheme,
		renderAlert,
		defaultAlertTheme,
		renderBadge,
		defaultBadgeTheme,
		renderStatusMessage,
		defaultStatusMessageTheme,
	} = shared

	const React = (await import('react')).default
	const { h } = await import('vue')

	const { wNodeToReact } =
		await import('../packages/react/build/wnode/wnode-to-react.js')
	const { wNodeToVue } =
		await import('../packages/vue/build/wnode/wnode-to-vue.js')
	//#endregion Imports

	//#region Baseline: direct createElement/h() (equivalent of master JSX, compiled)
	//
	// This replicates what the master branch Select produced directly from JSX,
	// as raw React.createElement / h() calls — same tree structure, no WNode layer.
	//
	const figures = { pointer: '❯', tick: '✔' }
	const selectStyles = defaultSelectTheme.styles

	function selectDirect_react(state) {
		const { visibleOptions, focusedValue, value, isDisabled, highlightText } =
			state
		return React.createElement(
			'wolfie-box',
			selectStyles.container(),
			...visibleOptions.map((option) => {
				const isFocused = !isDisabled && focusedValue === option.value
				const isSelected = value === option.value
				const rowChildren = []
				if (isFocused)
					rowChildren.push(
						React.createElement(
							'wolfie-text',
							{ key: 'fi', ...selectStyles.focusIndicator() },
							figures.pointer
						)
					)
				rowChildren.push(
					React.createElement(
						'wolfie-text',
						{ key: 'l', ...selectStyles.label({ isFocused, isSelected }) },
						option.label
					)
				)
				if (isSelected)
					rowChildren.push(
						React.createElement(
							'wolfie-text',
							{ key: 'si', ...selectStyles.selectedIndicator() },
							figures.tick
						)
					)
				return React.createElement(
					'wolfie-box',
					{ key: option.value, ...selectStyles.option({ isFocused }) },
					...rowChildren
				)
			})
		)
	}

	function selectDirect_vue(state) {
		const { visibleOptions, focusedValue, value, isDisabled } = state
		return h(
			'wolfie-box',
			selectStyles.container(),
			visibleOptions.map((option) => {
				const isFocused = !isDisabled && focusedValue === option.value
				const isSelected = value === option.value
				const rowChildren = []
				if (isFocused)
					rowChildren.push(
						h(
							'wolfie-text',
							{ key: 'fi', ...selectStyles.focusIndicator() },
							figures.pointer
						)
					)
				rowChildren.push(
					h(
						'wolfie-text',
						{ key: 'l', ...selectStyles.label({ isFocused, isSelected }) },
						option.label
					)
				)
				if (isSelected)
					rowChildren.push(
						h(
							'wolfie-text',
							{ key: 'si', ...selectStyles.selectedIndicator() },
							figures.tick
						)
					)
				return h(
					'wolfie-box',
					{ key: option.value, ...selectStyles.option({ isFocused }) },
					rowChildren
				)
			})
		)
	}
	//#endregion Baseline

	//#region Pipeline: render function approach (feature/render-functions branch)
	const selectTheme = { styles: selectStyles }

	function selectPipeline_react(state) {
		return wNodeToReact(renderSelect(state, selectTheme))
	}

	function selectPipeline_vue(state) {
		return wNodeToVue(renderSelect(state, selectTheme))
	}

	// Decomposed: measure each stage separately
	function selectStage1(state) {
		return renderSelect(state, selectTheme)
	}

	let _wnode
	function selectStage2_react() {
		return wNodeToReact(_wnode)
	}
	function selectStage2_vue() {
		return wNodeToVue(_wnode)
	}
	//#endregion Pipeline

	//#region Run benchmarks
	console.log('\n=== WOLFIE RENDER FUNCTION MICRO-BENCHMARK ===\n')
	console.log('Testing: Select (5 options, 1 focused, 1 selected)\n')

	// Pre-generate a wnode for stage2 benchmarks
	_wnode = renderSelect(SELECT_STATE, selectTheme)

	const opts = { warmup: 5000, batches: 200, batchSize: 500 }

	console.log('--- React ---')
	const rBase = bench(
		'baseline (direct createElement)',
		() => selectDirect_react(SELECT_STATE),
		opts
	)
	const rStage1 = bench(
		'stage 1: renderSelect() → WNode',
		() => selectStage1(SELECT_STATE),
		opts
	)
	const rStage2 = bench(
		'stage 2: wNodeToReact() → ReactElement',
		() => selectStage2_react(),
		opts
	)
	const rTotal = bench(
		'total pipeline (stage1 + stage2)',
		() => selectPipeline_react(SELECT_STATE),
		opts
	)

	console.log('\n--- Vue ---')
	const vBase = bench(
		'baseline (direct h())',
		() => selectDirect_vue(SELECT_STATE),
		opts
	)
	bench(
		'stage 1: renderSelect() → WNode',
		() => selectStage1(SELECT_STATE),
		opts
	)
	bench('stage 2: wNodeToVue() → VNode', () => selectStage2_vue(), opts)
	bench(
		'total pipeline (stage1 + stage2)',
		() => selectPipeline_vue(SELECT_STATE),
		opts
	)

	console.log('\n--- MultiSelect (same options) ---')
	const msStyles = defaultMultiSelectTheme.styles
	const msTheme = { styles: msStyles }
	bench(
		'baseline React (direct createElement)',
		() => {
			const { visibleOptions, focusedValue, value, isDisabled } =
				MULTI_SELECT_STATE
			return React.createElement(
				'wolfie-box',
				msStyles.container(),
				...visibleOptions.map((option) => {
					const isFocused = !isDisabled && focusedValue === option.value
					const isSelected = value.includes(option.value)
					const rowChildren = []
					if (isFocused)
						rowChildren.push(
							React.createElement(
								'wolfie-text',
								{ key: 'fi', ...msStyles.focusIndicator() },
								figures.pointer
							)
						)
					rowChildren.push(
						React.createElement(
							'wolfie-text',
							{ key: 'l', ...msStyles.label({ isFocused, isSelected }) },
							option.label
						)
					)
					if (isSelected)
						rowChildren.push(
							React.createElement(
								'wolfie-text',
								{ key: 'si', ...msStyles.selectedIndicator() },
								figures.tick
							)
						)
					return React.createElement(
						'wolfie-box',
						{ key: option.value, ...msStyles.option({ isFocused }) },
						...rowChildren
					)
				})
			)
		},
		opts
	)
	bench(
		'pipeline React (renderMultiSelect + wNodeToReact)',
		() => wNodeToReact(renderMultiSelect(MULTI_SELECT_STATE, msTheme)),
		opts
	)

	//#region Shared render-function benchmarks (framework-agnostic stage 1)
	// These measure the pure WNode descriptor construction cost — the same
	// computation occurs in React, Vue, Solid, and Angular before their
	// respective adapters convert the WNode into framework elements.
	console.log('\n--- Shared render functions (all adapters, stage 1 only) ---')
	bench(
		'renderSelect()       → WNode',
		() => renderSelect(SELECT_STATE, { styles: selectStyles }),
		opts
	)
	bench(
		'renderMultiSelect()  → WNode',
		() => renderMultiSelect(MULTI_SELECT_STATE, msTheme),
		opts
	)
	bench(
		'renderSpinner()      → WNode',
		() => renderSpinner({ frame: '⠋', label: 'Loading…' }, defaultSpinnerTheme),
		opts
	)
	bench(
		'renderTextInput()    → WNode',
		() =>
			renderTextInput({ inputValue: 'hello world▊' }, defaultTextInputTheme),
		opts
	)
	bench(
		'renderConfirmInput() → WNode',
		() =>
			renderConfirmInput(
				{ defaultChoice: 'confirm', isDisabled: false },
				defaultConfirmInputTheme
			),
		opts
	)
	bench(
		'renderAlert()        → WNode',
		() =>
			renderAlert(
				{ variant: 'success', title: 'Done', message: 'Task completed.' },
				defaultAlertTheme
			),
		opts
	)
	bench(
		'renderBadge()        → WNode',
		() => renderBadge({ label: 'ACTIVE', color: 'green' }, defaultBadgeTheme),
		opts
	)
	bench(
		'renderStatusMessage() → WNode',
		() =>
			renderStatusMessage(
				{ variant: 'info', message: 'System ready.' },
				defaultStatusMessageTheme
			),
		opts
	)
	//#endregion Shared render-function benchmarks

	//#region Summary
	console.log('\n=== SUMMARY ===\n')

	const overhead_react = rTotal.mean - rBase.mean
	const overhead_pct_react = ((overhead_react / rBase.mean) * 100).toFixed(1)
	const pipelineBreakdown = ((rStage1.mean / rTotal.mean) * 100).toFixed(0)

	console.log(`React Select overhead:`)
	console.log(`  baseline mean  : ${(rBase.mean * 1000).toFixed(3)}µs/op`)
	console.log(`  pipeline mean  : ${(rTotal.mean * 1000).toFixed(3)}µs/op`)
	console.log(
		`  delta          : ${(overhead_react * 1000).toFixed(3)}µs/op (${overhead_pct_react > 0 ? '+' : ''}${overhead_pct_react}%)`
	)
	console.log(`  renderSelect() : ${pipelineBreakdown}% of pipeline time`)
	console.log(
		`  wNodeToReact() : ${100 - parseInt(pipelineBreakdown)}% of pipeline time`
	)
	console.log()
	console.log(`Frame budget at 30fps: 33,333µs`)
	if (Math.abs(overhead_react) * 1000 < 100) {
		console.log(
			`  Overhead (${(overhead_react * 1000).toFixed(3)}µs) is <0.1% of frame budget → negligible`
		)
	} else {
		console.log(
			`  Overhead (${(overhead_react * 1000).toFixed(3)}µs) per Select render`
		)
	}
	//#endregion Summary

	//#endregion Run benchmarks
}

main().catch((e) => {
	console.error('Benchmark failed:', e)
	process.exit(1)
})
