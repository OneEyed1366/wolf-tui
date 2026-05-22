/* eslint-disable no-control-regex */
process.env.WOLFIE_VERIFY = '1'
process.env.FORCE_COLOR = '3'

import { describe, it, expect, beforeAll } from 'vitest'
import { render } from '@wolf-tui/solid/testing'
import { App } from '../src/index'
import stripAnsiMod from 'strip-ansi'
import chalk from 'chalk'

const stripAnsi = (stripAnsiMod as any).default ?? stripAnsiMod

describe('Solid Showcase Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	it('navigates through all community component demos and verifies rendering', async () => {
		const { stdout, stdin, unmount } = render(App, { columns: 80, rows: 30 })

		const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
		await delay(300)
		expect(stdout.frames.length).toBeGreaterThan(0)

		const send = (key: string) => stdin.write(key)

		const DOWN = '\x1b[B'
		const RIGHT = '\x1b[C'
		const ENTER = '\r'
		const ESC = '\x1b'

		async function openDemo(menuIndex: number) {
			for (let i = 0; i < menuIndex; i++) {
				send(DOWN)
				await delay(150)
			}
			send(ENTER)
			await delay(300)
		}

		const checks = []

		// Timer Demo
		await openDemo(0)
		const timerFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'Timer renders',
			pass: timerFrame.includes('Timer Demo'),
		})
		await send(ESC)
		await delay(200)

		// TreeView Demo
		await openDemo(1)
		let treeFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'TreeView renders',
			pass: treeFrame.includes('TreeView Demo'),
		})
		await send(RIGHT)
		await delay(100)
		treeFrame = stripAnsi(stdout.get())
		const hasExpanded =
			treeFrame.includes('components') ||
			treeFrame.includes('utils') ||
			treeFrame.includes('index.ts')
		checks.push({ name: 'TreeView expand works', pass: hasExpanded })
		await send(ESC)
		await delay(200)

		// Combobox Demo
		await openDemo(2)
		const comboFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'Combobox renders',
			pass: comboFrame.includes('Combobox Demo'),
		})
		await send(ESC)
		await delay(100)
		await send(ESC)
		await delay(200)

		// JsonViewer Demo
		await openDemo(3)
		const jsonFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'JsonViewer renders',
			pass: jsonFrame.includes('JsonViewer Demo'),
		})
		await send(ESC)
		await delay(200)

		// FilePicker Demo
		await openDemo(4)
		const fileFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'FilePicker renders',
			pass: fileFrame.includes('FilePicker Demo'),
		})
		await send(ESC)
		await delay(300)

		// Table Demo
		await openDemo(6)
		const tableFrame = stripAnsi(stdout.get())
		const hasTable =
			tableFrame.includes('Table Demo') &&
			tableFrame.includes('Naruto') &&
			tableFrame.includes('│')
		checks.push({ name: 'Table renders', pass: hasTable })
		await send(ESC)
		await delay(200)

		// Gradient Demo
		await openDemo(8)
		const gradStripped = stripAnsi(stdout.get())
		const gradRaw = stdout.get()
		checks.push({
			name: 'Gradient renders',
			pass: gradStripped.includes('Gradient Demo'),
		})
		const hasColors = /\x1b\[(?:38;[25];\d+(?:;\d+;\d+)?|3[0-7]|9[0-7])m/.test(
			gradRaw
		)
		checks.push({ name: 'Gradient emits ANSI colors', pass: hasColors })
		await send(ESC)
		await delay(200)

		for (const c of checks) {
			expect(c.pass, c.name).toBe(true)
		}
		unmount()
	}, 15000)
})
