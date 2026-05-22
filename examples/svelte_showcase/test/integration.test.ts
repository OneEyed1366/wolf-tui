/* eslint-disable no-control-regex */
process.env.WOLFIE_VERIFY = '1'
process.env.FORCE_COLOR = '3'

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import {
	render,
	cleanup,
	KEYS,
	delay,
	stripAnsi,
} from '@wolf-tui/svelte/testing'

import chalk from 'chalk'

describe('Svelte Showcase Integration', () => {
	beforeAll(() => {
		chalk.level = 3
	})

	afterEach(cleanup)

	it('runs the integration workflow', async () => {
		const { App } = await import('../dist/index.js')
		const { stdout, stdin } = render(App, { columns: 80, rows: 30 })

		await delay(300)
		expect(stdout.frames.length).toBeGreaterThan(0)

		const send = (key: string) => stdin.write(key)

		let currentIndex = 0
		async function openDemo(menuIndex: number) {
			if (currentIndex < menuIndex) {
				for (let i = currentIndex; i < menuIndex; i++) {
					send(KEYS.DOWN)
					await delay(150)
				}
			} else if (currentIndex > menuIndex) {
				for (let i = currentIndex; i > menuIndex; i--) {
					send(KEYS.UP)
					await delay(150)
				}
			}
			send(KEYS.ENTER)
			await delay(300)
			currentIndex = menuIndex
		}

		const checks = []

		// Timer Demo
		await openDemo(0)
		const timerFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'Timer renders',
			pass: timerFrame.includes('Timer Demo'),
		})
		await send(KEYS.ESC)
		await delay(300)

		// TreeView Demo
		await openDemo(1)
		let treeFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'TreeView renders',
			pass: treeFrame.includes('TreeView Demo'),
		})
		await send(KEYS.RIGHT)
		await delay(100)
		treeFrame = stripAnsi(stdout.get())
		const hasExpanded =
			treeFrame.includes('components') ||
			treeFrame.includes('utils') ||
			treeFrame.includes('index.ts')
		checks.push({ name: 'TreeView expand works', pass: hasExpanded })
		await send(KEYS.ESC)
		await delay(300)

		// Combobox Demo
		await openDemo(2)
		const comboFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'Combobox renders',
			pass: comboFrame.includes('Combobox Demo'),
		})
		await send(KEYS.ESC)
		await delay(100)
		await send(KEYS.ESC)
		await delay(300)

		// JsonViewer Demo
		await openDemo(3)
		const jsonFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'JsonViewer renders',
			pass: jsonFrame.includes('JsonViewer Demo'),
		})
		await send(KEYS.ESC)
		await delay(300)

		// FilePicker Demo
		await openDemo(4)
		const fileFrame = stripAnsi(stdout.get())
		checks.push({
			name: 'FilePicker renders',
			pass: fileFrame.includes('FilePicker Demo'),
		})
		await send(KEYS.ESC)
		await delay(500)

		// Table Demo
		await openDemo(6)
		const tableFrame = stripAnsi(stdout.get())
		const hasTable =
			tableFrame.includes('Table Demo') &&
			tableFrame.includes('Naruto') &&
			tableFrame.includes('│')
		checks.push({ name: 'Table renders', pass: hasTable })
		await send(KEYS.ESC)
		await delay(300)

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
		await send(KEYS.ESC)
		await delay(300)

		for (const c of checks) {
			expect(c.pass, c.name).toBe(true)
		}
	}, 15000)
})
