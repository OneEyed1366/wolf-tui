import { describe, it, expect } from 'vitest'
import React, { useState } from 'react'
import { Text } from '@wolf-tui/react'
import { useInput } from '@wolf-tui/react'
import { render } from '../src/react/index.js'

describe('React testing library adapter', () => {
	it('renders simple text component', () => {
		const { lastFrame, stdout } = render(
			React.createElement(Text, null, 'hello react test')
		)
		console.log('stdout frames in test:', stdout.frames)
		expect(lastFrame()).toContain('hello react test')
	})

	it('supports rerendering', () => {
		const TestComponent = ({ label }: { label: string }) => {
			return React.createElement(Text, null, label)
		}

		const { lastFrame, rerender } = render(
			React.createElement(TestComponent, { label: 'first' })
		)
		expect(lastFrame()).toContain('first')

		rerender(React.createElement(TestComponent, { label: 'second' }))
		expect(lastFrame()).toContain('second')
	})

	it('simulates keyboard input via stdin.write', async () => {
		const InputHandler = () => {
			const [key, setKey] = useState('')
			useInput((input, _keyData) => {
				setKey(input)
			})
			return React.createElement(Text, null, `key: ${key}`)
		}

		const { lastFrame, stdin } = render(React.createElement(InputHandler))
		expect(lastFrame()).toContain('key:')

		await stdin.write('x')
		expect(lastFrame()).toContain('key: x')

		await stdin.write('y')
		expect(lastFrame()).toContain('key: y')
	})
})
