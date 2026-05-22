/* eslint-disable no-control-regex */
process.env.WOLFIE_VERIFY = '1'
process.env.FORCE_COLOR = '3'

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import React from 'react'
import {
	render,
	cleanup,
	KEYS,
	delay,
	stripAnsi,
} from '@wolf-tui/react/testing'
import { App } from '../src/App'

import chalk from 'chalk'

describe('React Invaders Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	afterEach(cleanup)

	it('navigates through menu screens and starts the game', async () => {
		const { stdout, stdin, lastFrame } = render(React.createElement(App), {
			columns: 80,
			rows: 24,
		})
		expect(stdout.frames.length).toBeGreaterThan(0)

		const send = (key: string) => stdin.write(key)

		await delay(100)
		expect(stripAnsi(lastFrame() ?? '')).toContain('Start Game')

		// Help: Down×3, Enter
		await send(KEYS.DOWN)
		await send(KEYS.DOWN)
		await send(KEYS.DOWN)
		await send(KEYS.ENTER)
		await delay(100)
		expect(stripAnsi(lastFrame() ?? '')).toContain('Controls')

		// Escape back to menu
		await send(KEYS.ESC)
		await delay(100)

		// Settings: Down×2, Enter
		await send(KEYS.DOWN)
		await send(KEYS.DOWN)
		await send(KEYS.ENTER)
		await delay(100)
		expect(stripAnsi(lastFrame() ?? '')).toContain('Difficulty')

		// Escape back to menu
		await send(KEYS.ESC)
		await delay(100)

		// High Scores: Down×1, Enter
		await send(KEYS.DOWN)
		await send(KEYS.ENTER)
		await delay(100)
		expect(stripAnsi(lastFrame() ?? '')).toContain('HIGH SCORES')

		// Escape back to menu
		await send(KEYS.ESC)
		await delay(100)

		// Start Game: wrap back to top, Enter
		await send(KEYS.UP)
		await send(KEYS.UP)
		await send(KEYS.UP)
		await send(KEYS.UP)
		await send(KEYS.ENTER)
		await delay(200)

		const gameFrame = stripAnsi(lastFrame() ?? '')
		expect(gameFrame).toContain('SCORE')
		expect(gameFrame).toContain('^')
	}, 15000)
})
