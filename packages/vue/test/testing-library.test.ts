/* eslint-disable react-hooks/rules-of-hooks */
import { describe, it, expect } from 'vitest'
import { defineComponent, ref, h } from 'vue'
import { Text } from '../src/components'
import { useInput } from '../src/composables/use-input'
import { render } from '../src/testing/index'

describe('Vue testing library adapter', () => {
	it('renders simple text component', async () => {
		const TestComponent = defineComponent({
			setup() {
				return () => h(Text, null, () => 'hello vue test')
			},
		})
		const { lastFrame, unmount } = render(TestComponent)
		// Wait a tick for Vue reactive render scheduler
		await new Promise((r) => setTimeout(r, 50))
		expect(lastFrame()).toContain('hello vue test')
		unmount()
	})

	it('supports rerendering', async () => {
		const TestComponent = defineComponent({
			props: ['label'],
			setup(props) {
				return () => h(Text, null, () => props.label)
			},
		})

		const currentLabel = ref('first')
		const Root = defineComponent({
			setup() {
				return () => h(TestComponent, { label: currentLabel.value })
			},
		})

		const { lastFrame, unmount } = render(Root)
		await new Promise((r) => setTimeout(r, 50))
		expect(lastFrame()).toContain('first')

		currentLabel.value = 'second'
		await new Promise((r) => setTimeout(r, 50))
		expect(lastFrame()).toContain('second')
		unmount()
	})

	it('simulates keyboard input via stdin.write', async () => {
		const InputHandler = defineComponent({
			setup() {
				const key = ref('')
				useInput((input) => {
					key.value = input
				})
				return () => h(Text, null, () => `key:${key.value}`)
			},
		})

		const { lastFrame, stdin, unmount } = render(InputHandler)
		await new Promise((r) => setTimeout(r, 50))
		expect(lastFrame()).toContain('key:')

		await stdin.write('x')
		expect(lastFrame()).toContain('key:x')

		await stdin.write('y')
		expect(lastFrame()).toContain('key:y')
		unmount()
	})
})
