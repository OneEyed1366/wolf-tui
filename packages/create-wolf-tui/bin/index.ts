#!/usr/bin/env node

import { checkNodeVersion } from '../src/utils'

const versionError = checkNodeVersion()
if (versionError) {
	console.error(versionError)
	process.exit(1)
}

const { runCli } = await import('../src/cli')
await runCli(process.argv.slice(2))
