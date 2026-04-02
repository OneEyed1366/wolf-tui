import { defineBuildConfig } from 'unbuild'
import { execSync } from 'node:child_process'

export default defineBuildConfig({
	entries: ['bin/index', 'src/index'],
	failOnWarn: false,
	rollup: {
		emitCJS: false,
		inlineDependencies: true,
	},
	hooks: {
		'build:before': () => {
			execSync('tsx scripts/bake-versions.ts', { stdio: 'inherit' })
		},
	},
})
