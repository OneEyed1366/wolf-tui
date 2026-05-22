/* eslint-disable no-control-regex */
process.env.WOLFIE_VERIFY = '1'
process.env.FORCE_COLOR = '3'

import { describe, it, expect, beforeAll } from 'vitest'
import { render } from '@wolf-tui/svelte/testing'
import chalk from 'chalk'

describe('Svelte Invaders Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	it('runs the integration workflow', async () => {
		const { App } = await import('../dist/index.js')
		const { stdout, stdin, unmount } = render(App, { columns: 120, rows: 40 })

		const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
		await delay(300)
		expect(stdout.frames.length).toBeGreaterThan(0)

		const send = (key: string) => stdin.write(key)

		const DOWN = '\x1b[B'
		const ENTER = '\r'
		const ESC = '\x1b'

		// Help: Down×3, Enter
		await send(DOWN)
		await delay(150)
		await send(DOWN)
		await delay(150)
		await send(DOWN)
		await delay(150)
		await send(ENTER)
		await delay(500)

		await send(ESC)
		await delay(200)

		unmount()
	}, 15000)
})
