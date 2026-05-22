/* eslint-disable no-control-regex */
process.env.WOLFIE_VERIFY = '1'
process.env.FORCE_COLOR = '3'

import { describe, it, expect, beforeAll } from 'vitest'
import React from 'react'
import { render } from '@wolf-tui/react/testing'
import stripAnsiMod from 'strip-ansi'
import chalk from 'chalk'

const stripAnsi = (stripAnsiMod as any).default ?? stripAnsiMod

describe('React Showcase Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	it('navigates through all community component demos and verifies rendering', async () => {
		const { App } = await import('../src/index')
		const { stdout, stdin, lastFrame, unmount } = render(
			React.createElement(App),
			{ columns: 80, rows: 30 }
		)
		expect(stdout.frames.length).toBeGreaterThan(0)

		const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
		const send = (key: string) => stdin.write(key)

		const DOWN = '\x1b[B'
		const UP = '\x1b[A'
		const RIGHT = '\x1b[C'
		const ENTER = '\r'
		const ESC = '\x1b'

		await delay(100)
		expect(stripAnsi(lastFrame() ?? '')).toContain('Timer / Countdown')

		async function openDemo(menuIndex: number) {
			for (let i = 0; i < 5; i++) await send(UP)
			await delay(50)
			for (let i = 0; i < menuIndex; i++) {
				await send(DOWN)
				await delay(50)
			}
			await send(ENTER)
			await delay(300)
		}

		// Timer Demo
		await openDemo(0)
		expect(stripAnsi(lastFrame() ?? '')).toContain('Timer Demo')
		await send(ESC)
		await delay(200)

		// TreeView Demo
		await openDemo(1)
		expect(stripAnsi(lastFrame() ?? '')).toContain('TreeView Demo')
		await send(RIGHT)
		await delay(100)
		const treeFrame = stripAnsi(lastFrame() ?? '')
		expect(
			treeFrame.includes('components') ||
				treeFrame.includes('utils') ||
				treeFrame.includes('index.ts')
		).toBe(true)
		await send(ESC)
		await delay(200)

		// Combobox Demo
		await openDemo(2)
		expect(stripAnsi(lastFrame() ?? '')).toContain('Combobox Demo')
		await send(ESC)
		await delay(100)
		await send(ESC)
		await delay(200)

		// JsonViewer Demo
		await openDemo(3)
		expect(stripAnsi(lastFrame() ?? '')).toContain('JsonViewer Demo')
		await send(ESC)
		await delay(200)

		// FilePicker Demo
		await openDemo(4)
		expect(stripAnsi(lastFrame() ?? '')).toContain('FilePicker Demo')
		await send(ESC)
		await delay(200)

		// Table Demo
		await openDemo(6) // wait, index 5 is BigText, table is at index 6 (based on list starting from timer (0))
		const tableFrame = stripAnsi(lastFrame() ?? '')
		expect(tableFrame).toContain('Table Demo')
		expect(tableFrame).toContain('Naruto')
		expect(tableFrame).toContain('│')
		await send(ESC)
		await delay(200)

		// ScrollView Demo
		await openDemo(7)
		let scrollFrame = stripAnsi(lastFrame() ?? '')
		expect(scrollFrame).toContain('ScrollView Demo')
		const itemMatchesBefore = (scrollFrame.match(/Item \d\d/g) || []).length
		expect(itemMatchesBefore).toBeGreaterThan(0)
		expect(itemMatchesBefore).toBeLessThanOrEqual(10)

		await send(DOWN)
		await delay(50)
		await send(DOWN)
		await delay(50)
		await send(DOWN)
		await delay(100)
		scrollFrame = stripAnsi(lastFrame() ?? '')
		expect(scrollFrame).toContain('offset=3')
		await send(ESC)
		await delay(200)

		// Gradient Demo
		await openDemo(8)
		const gradStripped = stripAnsi(lastFrame() ?? '')
		const gradRaw = lastFrame() ?? ''
		expect(gradStripped).toContain('Gradient Demo')
		const hasColors = /\x1b\[(?:38;[25];\d+(?:;\d+;\d+)?|3[0-7]|9[0-7])m/.test(
			gradRaw
		)
		expect(hasColors).toBe(true)
		await send(ESC)
		await delay(200)

		unmount()
	}, 15000)
})
