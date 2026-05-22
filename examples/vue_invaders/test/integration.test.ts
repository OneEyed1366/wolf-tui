/* eslint-disable no-control-regex */
process.env.WOLFIE_VERIFY = '1'
process.env.FORCE_COLOR = '3'

import { describe, it, expect, beforeAll } from 'vitest'
import { render, KEYS, delay } from '@wolf-tui/vue/testing'
import stripAnsiMod from 'strip-ansi'
import chalk from 'chalk'

const stripAnsi = (stripAnsiMod as any).default ?? stripAnsiMod

describe('Vue Invaders Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	it('runs the integration workflow', async () => {
		const { App } = await import('../dist/index.js')
		const { stdout, stdin, unmount } = render(App, { columns: 80, rows: 24 })
		expect(stdout.frames.length).toBeGreaterThan(0)

		const send = (key: string) => stdin.write(key)

		await delay(200)
		expect(stripAnsi(stdout.get())).toContain('Start Game')

		// Help: Down×3, Enter
		await send(KEYS.DOWN)
		await send(KEYS.DOWN)
		await send(KEYS.DOWN)
		await send(KEYS.ENTER)
		await delay(200)
		expect(stripAnsi(stdout.get())).toContain('Controls')

		await send(KEYS.ESC)
		await delay(200)

		// Settings: Down×2, Enter
		await send(KEYS.DOWN)
		await send(KEYS.DOWN)
		await send(KEYS.ENTER)
		await delay(200)

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
		await delay(400)

		const gameFrame = stripAnsi(stdout.get())
		expect(gameFrame).toContain('SCORE')
		expect(gameFrame).toContain('^')

		unmount()
	}, 15000)
})
