/* eslint-disable no-control-regex */
process.env.WOLFIE_VERIFY = '1'
process.env.FORCE_COLOR = '3'

import { describe, it, expect, beforeAll } from 'vitest'
import { render } from '@wolf-tui/solid/testing'
import { App } from '../src/index'
import chalk from 'chalk'

describe('Solid Invaders Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	it('runs the integration workflow', async () => {
		const { stdout, stdin, unmount } = render(App, { columns: 80, rows: 24 })

		const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
		await delay(300)
		expect(stdout.frames.length).toBeGreaterThan(0)

		const send = (key: string) => stdin.write(key)

		const DOWN = '\x1b[B'
		const UP = '\x1b[A'
		const ENTER = '\r'
		const ESC = '\x1b'

		// Help: Down×3, Enter
		await send(DOWN)
		await send(DOWN)
		await send(DOWN)
		await send(ENTER)
		await delay(300)

		await send(ESC)
		await delay(200)

		// Settings: Down×2, Enter
		await send(DOWN)
		await send(DOWN)
		await send(ENTER)
		await delay(300)

		await send(ESC)
		await delay(200)

		// High Scores: Down×1, Enter
		await send(DOWN)
		await send(ENTER)
		await delay(200)

		await send(ESC)
		await delay(200)

		// Start Game: wrap back to top, Enter
		await send(UP)
		await send(UP)
		await send(UP)
		await send(UP)
		await send(ENTER)
		await delay(200)

		unmount()
	}, 15000)
})
