/* eslint-disable no-control-regex */
process.env.WOLFIE_VERIFY = '1'
process.env.FORCE_COLOR = '3'

import 'zone.js'
import '@angular/compiler'
import { describe, it, expect, beforeAll } from 'vitest'
import chalk from 'chalk'
import { AppComponent } from '../src/app.component'
import { render } from '@wolf-tui/angular/testing'
import { NgZone } from '@angular/core'
import stripAnsiMod from 'strip-ansi'

const stripAnsi = (stripAnsiMod as any).default ?? stripAnsiMod

describe('angular_invaders Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	it('runs the integration workflow', async () => {
		const ngZone = new NgZone({ enableLongStackTrace: false })
		const delay = (ms: number) =>
			new Promise((r) => ngZone.runOutsideAngular(() => setTimeout(r, ms)))

		const DOWN = '\x1b[B'
		const UP = '\x1b[A'
		const ENTER = '\r'
		const ESC = '\x1b'

		const { stdout, stdin, unmount } = await render(AppComponent, {
			columns: 80,
			rows: 24,
		})
		expect(stdout.frames.length).toBeGreaterThan(0)

		await delay(500)
		expect(stripAnsi(stdout.get())).toContain('Start Game')

		// Help: Down×3, Enter
		stdin.write(DOWN)
		await delay(300)
		stdin.write(DOWN)
		await delay(300)
		stdin.write(DOWN)
		await delay(300)
		stdin.write(ENTER)
		await delay(300)
		expect(stripAnsi(stdout.get())).toContain('HELP')

		stdin.write(ESC)
		await delay(300)

		// Settings: Down×2, Enter
		stdin.write(DOWN)
		await delay(300)
		stdin.write(DOWN)
		await delay(300)
		stdin.write(ENTER)
		await delay(300)

		stdin.write(ESC)
		await delay(300)

		// High Scores: Down×1, Enter
		stdin.write(DOWN)
		await delay(300)
		stdin.write(ENTER)
		await delay(300)

		stdin.write(ESC)
		await delay(300)

		// Start Game: wrap back to top, Enter
		stdin.write(UP)
		await delay(300)
		stdin.write(UP)
		await delay(300)
		stdin.write(UP)
		await delay(300)
		stdin.write(UP)
		await delay(300)
		stdin.write(ENTER)
		await delay(500)

		unmount()
	}, 15000)
})
