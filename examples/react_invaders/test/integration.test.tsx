import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@wolf-tui/react/testing'
import { App } from '../src/App'
import stripAnsiMod from 'strip-ansi'

const stripAnsi = (stripAnsiMod as any).default ?? stripAnsiMod

describe('React Invaders Integration', () => {
	it('navigates through menu screens and starts the game', async () => {
		const { stdout, stdin, lastFrame, unmount } = render(
			React.createElement(App),
			{ columns: 80, rows: 24 }
		)
		expect(stdout.frames.length).toBeGreaterThan(0)

		const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
		const send = (key: string) => stdin.write(key)

		const DOWN = '\x1b[B'
		const UP = '\x1b[A'
		const ENTER = '\r'
		const ESC = '\x1b'

		await delay(100)
		expect(stripAnsi(lastFrame() ?? '')).toContain('Start Game')

		// Help: Down×3, Enter
		await send(DOWN)
		await send(DOWN)
		await send(DOWN)
		await send(ENTER)
		await delay(100)
		expect(stripAnsi(lastFrame() ?? '')).toContain('Controls')

		// Escape back to menu
		await send(ESC)
		await delay(100)

		// Settings: Down×2, Enter
		await send(DOWN)
		await send(DOWN)
		await send(ENTER)
		await delay(100)
		expect(stripAnsi(lastFrame() ?? '')).toContain('Difficulty')

		// Escape back to menu
		await send(ESC)
		await delay(100)

		// High Scores: Down×1, Enter
		await send(DOWN)
		await send(ENTER)
		await delay(100)
		expect(stripAnsi(lastFrame() ?? '')).toContain('HIGH SCORES')

		// Escape back to menu
		await send(ESC)
		await delay(100)

		// Start Game: wrap back to top, Enter
		await send(UP)
		await send(UP)
		await send(UP)
		await send(UP)
		await send(ENTER)
		await delay(200)

		const gameFrame = stripAnsi(lastFrame() ?? '')
		expect(gameFrame).toContain('SCORE')
		expect(gameFrame).toContain('^') // Player ship

		unmount()
	})
})
