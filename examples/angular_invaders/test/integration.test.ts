/* eslint-disable no-control-regex */
process.env.WOLFIE_VERIFY = '1'
process.env.FORCE_COLOR = '3'

import 'zone.js'
import '@angular/compiler'
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import chalk from 'chalk'
import { AppComponent } from '../src/app.component'
import { render, cleanup, KEYS, stripAnsi } from '@wolf-tui/angular/testing'
import { NgZone } from '@angular/core'

describe('angular_invaders Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	afterEach(cleanup)

	it('runs the integration workflow', async () => {
		const ngZone = new NgZone({ enableLongStackTrace: false })
		const delay = (ms: number) =>
			new Promise((r) => ngZone.runOutsideAngular(() => setTimeout(r, ms)))

		const { stdout, stdin } = await render(AppComponent, {
			columns: 80,
			rows: 24,
		})
		expect(stdout.frames.length).toBeGreaterThan(0)

		await delay(500)
		expect(stripAnsi(stdout.get())).toContain('Start Game')

		// Help: Down×3, Enter
		stdin.write(KEYS.DOWN)
		await delay(300)
		stdin.write(KEYS.DOWN)
		await delay(300)
		stdin.write(KEYS.DOWN)
		await delay(300)
		stdin.write(KEYS.ENTER)
		await delay(300)
		expect(stripAnsi(stdout.get())).toContain('HELP')

		stdin.write(KEYS.ESC)
		await delay(300)

		// Settings: Down×2, Enter
		stdin.write(KEYS.DOWN)
		await delay(300)
		stdin.write(KEYS.DOWN)
		await delay(300)
		stdin.write(KEYS.ENTER)
		await delay(300)

		stdin.write(KEYS.ESC)
		await delay(300)

		// High Scores: Down×1, Enter
		stdin.write(KEYS.DOWN)
		await delay(300)
		stdin.write(KEYS.ENTER)
		await delay(300)

		stdin.write(KEYS.ESC)
		await delay(300)

		// Start Game: wrap back to top, Enter
		stdin.write(KEYS.UP)
		await delay(300)
		stdin.write(KEYS.UP)
		await delay(300)
		stdin.write(KEYS.UP)
		await delay(300)
		stdin.write(KEYS.UP)
		await delay(300)
		stdin.write(KEYS.ENTER)
		await delay(500)
	}, 15000)
})
