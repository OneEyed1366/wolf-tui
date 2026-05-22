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

describe('angular_showcase Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	it('runs the integration workflow', async () => {
		const ngZone = new NgZone({ enableLongStackTrace: false })
		const delay = (ms: number) =>
			new Promise((r) => ngZone.runOutsideAngular(() => setTimeout(r, ms)))

		const { stdout, stdin, unmount } = await render(AppComponent, {
			columns: 80,
			rows: 30,
		})
		expect(stdout.frames.length).toBeGreaterThan(0)

		const DOWN = '\x1b[B'
		const UP = '\x1b[A'
		const RIGHT = '\x1b[C'
		const ENTER = '\r'
		const ESC = '\x1b'

		const send = (key) => stdin.write(key)

		let currentIndex = 0
		async function openDemo(menuIndex) {
			if (currentIndex < menuIndex) {
				for (let i = currentIndex; i < menuIndex; i++) {
					send(DOWN)
					await delay(150)
				}
			} else if (currentIndex > menuIndex) {
				for (let i = currentIndex; i > menuIndex; i--) {
					send(UP)
					await delay(150)
				}
			}
			send(ENTER)
			await delay(300)
			currentIndex = menuIndex
		}

		await delay(500)
		expect(stripAnsi(stdout.get())).toContain('Timer / Countdown')

		const checks = []

		// Timer Demo
		await openDemo(0)
		const timerFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'Timer renders',
			pass: timerFrame.includes('Timer Demo'),
		})
		stdin.write(ESC)
		await delay(500)

		// TreeView Demo
		await openDemo(1)
		let treeFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'TreeView renders',
			pass: treeFrame.includes('TreeView Demo'),
		})
		stdin.write(RIGHT)
		await delay(100)
		treeFrame = stripAnsi(stdout.get())
		const hasExpanded =
			treeFrame.includes('components') ||
			treeFrame.includes('utils') ||
			treeFrame.includes('index.ts')
		checks.push({ name: 'TreeView expand works', pass: hasExpanded })
		stdin.write(ESC)
		await delay(500)

		// Combobox Demo
		await openDemo(2)
		const comboFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'Combobox renders',
			pass: comboFrame.includes('Combobox Demo'),
		})
		stdin.write(ESC)
		await delay(100)
		stdin.write(ESC)
		await delay(500)

		// JsonViewer Demo
		await openDemo(3)
		const jsonFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'JsonViewer renders',
			pass: jsonFrame.includes('JsonViewer Demo'),
		})
		stdin.write(ESC)
		await delay(500)

		// FilePicker Demo
		await openDemo(4)
		const fileFrame = stripAnsi(stdout.get())
		let hasFile = false
		const totalFrames = stdout.frameCount()
		for (let i = Math.max(0, totalFrames - 5); i < totalFrames; i++) {
			const f = stripAnsi(stdout.getFrame(i))
			if (f.includes('FilePicker Demo')) {
				hasFile = true
				break
			}
		}
		if (!hasFile) {
			hasFile =
				fileFrame.includes('build/') || fileFrame.includes('node_modules/')
		}
		checks.push({ name: 'FilePicker renders', pass: hasFile })
		stdin.write(ESC)
		await delay(500)

		// Table Demo
		await openDemo(6)
		const tableFrame = stripAnsi(stdout.get())
		const hasTable =
			tableFrame.includes('Table Demo') &&
			tableFrame.includes('Naruto') &&
			tableFrame.includes('│')
		checks.push({ name: 'Table renders', pass: hasTable })
		stdin.write(ESC)
		await delay(500)

		// Gradient Demo
		await openDemo(8)
		const gradFrameStripped = stripAnsi(stdout.get())
		const gradFrameRaw = stdout.get()
		const hasGrad = gradFrameStripped.includes('Gradient Demo')
		const hasColors = /\x1b\[(?:38;[25];\d+(?:;\d+;\d+)?|3[0-7]|9[0-7])m/.test(
			gradFrameRaw
		)
		checks.push({ name: 'Gradient renders', pass: hasGrad })
		checks.push({ name: 'Gradient emits ANSI colors', pass: hasColors })
		stdin.write(ESC)
		await delay(500)

		for (const c of checks) {
			expect(c.pass, c.name).toBe(true)
		}
		unmount()
	}, 15000)
})
