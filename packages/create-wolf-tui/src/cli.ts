import {
	intro,
	outro,
	text,
	select,
	multiselect,
	confirm,
	cancel,
	isCancel,
	spinner,
} from '@clack/prompts'
import type { IProjectConfig, Framework, Bundler, CssPreset } from './types'
import { isSupported, getBundlerOptions, getBlockedMessage } from './matrix'
import {
	detectPackageManager,
	isDirEmpty,
	prepareTargetDir,
	runInstall,
	initGit,
} from './utils'
import { compose } from './composer'
import { renderProject } from './renderer'
import { resolve } from 'node:path'

//#region Flag Parsing

interface ICliFlags {
	framework?: string
	bundler?: string
	css?: string
	lint?: boolean
	git?: boolean
	yes?: boolean
	name?: string
}

export function parseFlags(argv: string[]): ICliFlags {
	const flags: ICliFlags = {}
	const positional: string[] = []

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]!
		if (arg === '--framework' || arg === '-f') {
			flags.framework = argv[++i]
			continue
		}
		if (arg === '--bundler' || arg === '-b') {
			flags.bundler = argv[++i]
			continue
		}
		if (arg === '--css') {
			flags.css = argv[++i]
			continue
		}
		if (arg === '--lint') {
			flags.lint = true
			continue
		}
		if (arg === '--no-lint') {
			flags.lint = false
			continue
		}
		if (arg === '--git') {
			flags.git = true
			continue
		}
		if (arg === '--no-git') {
			flags.git = false
			continue
		}
		if (arg === '--yes' || arg === '-y') {
			flags.yes = true
			continue
		}
		if (!arg.startsWith('-')) positional.push(arg)
	}

	if (positional.length > 0) flags.name = positional[0]
	return flags
}

//#endregion Flag Parsing

//#region Interactive Prompts

export async function runCli(argv: string[]): Promise<void> {
	const flags = parseFlags(argv)

	intro('create-wolf-tui')

	// Project name
	let name = flags.name
	if (!name) {
		const result = await text({
			message: 'Project name?',
			placeholder: 'my-wolf-app',
			defaultValue: 'my-wolf-app',
		})
		if (isCancel(result)) {
			cancel('Cancelled.')
			process.exit(0)
		}
		name = result || 'my-wolf-app'
	}

	const targetDir = resolve(process.cwd(), name)
	// Use just the directory name for package.json name, not full path
	const projectName = name.includes('/') ? name.split('/').pop()! : name

	// Directory conflict
	if (!isDirEmpty(targetDir)) {
		const action = await select({
			message: `Directory "${name}" is not empty.`,
			options: [
				{ value: 'overwrite', label: 'Overwrite existing files' },
				{ value: 'merge', label: 'Merge (keep existing, add new)' },
				{ value: 'cancel', label: 'Cancel' },
			],
		})
		if (isCancel(action) || action === 'cancel') {
			cancel('Cancelled.')
			process.exit(0)
		}
		if (action === 'overwrite') prepareTargetDir(targetDir, 'overwrite')
	}

	// Framework
	let framework: Framework
	if (flags.framework) {
		framework = flags.framework as Framework
	} else {
		const result = await select({
			message: 'Framework?',
			options: [
				{ value: 'react', label: 'React' },
				{ value: 'vue', label: 'Vue' },
				{ value: 'angular', label: 'Angular' },
				{ value: 'solid', label: 'Solid' },
				{ value: 'svelte', label: 'Svelte' },
			],
		})
		if (isCancel(result)) {
			cancel('Cancelled.')
			process.exit(0)
		}
		framework = result as Framework
	}

	// Bundler (filtered by framework)
	let bundler: Bundler
	if (flags.bundler) {
		bundler = flags.bundler as Bundler
		if (!isSupported(framework, bundler)) {
			console.error(getBlockedMessage(framework, bundler))
			process.exit(1)
		}
	} else {
		const options = getBundlerOptions(framework).map((o) => ({
			value: o.value,
			label: o.label + (o.hint ? ` (${o.hint})` : ''),
			disabled: o.disabled,
		}))
		const result = await select({ message: 'Bundler?', options })
		if (isCancel(result)) {
			cancel('Cancelled.')
			process.exit(0)
		}
		bundler = result as Bundler
	}

	// CSS preprocessors
	let css: CssPreset[] = []
	if (flags.css) {
		css = flags.css.split(',').filter(Boolean) as CssPreset[]
	} else if (!flags.yes) {
		const result = await multiselect({
			message: 'CSS preprocessors? (space to select, enter to confirm)',
			options: [
				{ value: 'tailwind', label: 'Tailwind (PostCSS)' },
				{ value: 'sass', label: 'Sass' },
				{ value: 'less', label: 'Less' },
				{ value: 'stylus', label: 'Stylus' },
			],
			required: false,
		})
		if (isCancel(result)) {
			cancel('Cancelled.')
			process.exit(0)
		}
		css = (result ?? []) as CssPreset[]
	}

	// Lint
	let lint: boolean
	if (flags.lint !== undefined) {
		lint = flags.lint
	} else if (flags.yes) {
		lint = false
	} else {
		const result = await confirm({ message: 'Add ESLint + Prettier?' })
		if (isCancel(result)) {
			cancel('Cancelled.')
			process.exit(0)
		}
		lint = result
	}

	// Git
	let git: boolean
	if (flags.git !== undefined) {
		git = flags.git
	} else if (flags.yes) {
		git = true
	} else {
		const result = await confirm({
			message: 'Initialize git repository?',
		})
		if (isCancel(result)) {
			cancel('Cancelled.')
			process.exit(0)
		}
		git = result
	}

	// Install
	let install: boolean
	if (flags.yes) {
		install = true
	} else {
		const result = await confirm({ message: 'Install dependencies?' })
		if (isCancel(result)) {
			cancel('Cancelled.')
			process.exit(0)
		}
		install = result
	}

	// Compose + render
	const s = spinner()
	s.start('Composing project...')

	const config: IProjectConfig = {
		name: projectName,
		framework,
		bundler,
		css,
		lint,
		git,
		install,
		targetDir,
	}

	const composed = compose(config)
	renderProject(composed, targetDir)

	s.stop('Project created!')

	// Git init
	if (git) {
		initGit(targetDir)
	}

	// Install deps
	const pm = detectPackageManager()
	if (install) {
		s.start(`Installing dependencies with ${pm}...`)
		const result = runInstall(targetDir, pm)
		if (result.ok) {
			s.stop('Dependencies installed!')
		} else {
			s.stop(`Install failed. Run \`${pm} install\` manually.`)
		}
	}

	// Print warnings
	if (composed.warnings.length > 0) {
		for (const w of composed.warnings) {
			console.warn(`  ⚠ ${w}`)
		}
	}

	outro(`Done! cd ${name} && ${pm} dev`)
}

//#endregion Interactive Prompts
