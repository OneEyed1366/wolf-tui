/* eslint-disable no-control-regex */
process.env.WOLFIE_VERIFY = '1'
process.env.FORCE_COLOR = '3'

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { render, cleanup, KEYS, delay } from '@wolf-tui/solid/testing'
import { App } from '../src/index'
import chalk from 'chalk'

describe('Solid Invaders Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	afterEach(cleanup)

	it('runs the integration workflow', async () => {
		const { stdout, stdin } = render(App, { columns: 80, rows: 24 })

		await delay(300)
		expect(stdout.frames.length).toBeGreaterThan(0)

		const send = (key: string) => stdin.write(key)

		// Help: Down×3, Enter
		await send(KEYS.DOWN)
		await send(KEYS.DOWN)
		await send(KEYS.DOWN)
		await send(KEYS.ENTER)
		await delay(300)

		await send(KEYS.ESC)
		await delay(200)

		// Settings: Down×2, Enter
		await send(KEYS.DOWN)
		await send(KEYS.DOWN)
		await send(KEYS.ENTER)
		await delay(300)

		await send(KEYS.ESC)
		await delay(200)

		// High Scores: Down×1, Enter
		await send(KEYS.DOWN)
		await send(KEYS.ENTER)
		await delay(200)

		await send(KEYS.ESC)
		await delay(200)

		// Start Game: wrap back to top, Enter
		await send(KEYS.UP)
		await send(KEYS.UP)
		await send(KEYS.UP)
		await send(KEYS.UP)
		await send(KEYS.ENTER)
		await delay(200)
	}, 15000)
})
